#!/usr/bin/env python3
"""Word timestamps for a voice file -> public/words.json

    python3 tools/word_times.py public/voice/ep1.wav [--model small] [--lang hi|en] [--script script.txt] [--out public/words.json]

1) Whisper (model stored in ./models/whisper) with word_timestamps=True.
2) If Whisper or its model download is unavailable, falls back to LINE times from
   ffmpeg silencedetect (each stretch of speech between pauses = one line).
   With --script (one line of text per spoken line) the lines get their text.

Output: {"source", "audio", "duration", "words":[{"word","start","end"}], "lines":[{"start","end","text"}]}
"""
import argparse, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", path], text=True).strip())


def whisper_words(path, model_name, lang):
    import whisper  # noqa
    model = whisper.load_model(model_name, download_root=os.path.join(ROOT, "models", "whisper"))
    # condition_on_previous_text=False stops Whisper getting stuck and dropping the rest (seen on Hindi)
    res = model.transcribe(path, word_timestamps=True, language=lang, fp16=False, verbose=False,
                           condition_on_previous_text=False)
    words, lines = [], []
    for seg in res["segments"]:
        lines.append({"start": round(seg["start"], 3), "end": round(seg["end"], 3), "text": seg["text"].strip()})
        for w in seg.get("words", []):
            words.append({"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)})
    return words, lines


PUNCT = ",.?!।॥\"'“”‘’:;()-–—…"


def _strip(w):
    return w.strip().strip(PUNCT)


def _norm(w):
    w = re.sub(r"\[.*?\]", "", w)
    w = _strip(w).lower()
    w = re.sub(r"(.)\1+", r"\1", w)            # stretched letters: हूँँँ -> हूँ
    return w.replace("\u093c", "")              # drop nukta


def align_to_script(words, script_words):
    """Gives each heard word the spelling of the matching script word (keeps Whisper's times).
    Global alignment (Needleman-Wunsch) on letter similarity; returns (words, matched_count)."""
    import difflib
    a, b = [_norm(w["word"]) for w in words], [_norm(w) for w in script_words]
    n, m = len(a), len(b)
    sim = lambda i, j: difflib.SequenceMatcher(None, a[i], b[j]).ratio()
    G = -0.4
    S = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): S[i][0] = i * G
    for j in range(1, m + 1): S[0][j] = j * G
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            S[i][j] = max(S[i-1][j-1] + sim(i-1, j-1) - 0.3, S[i-1][j] + G, S[i][j-1] + G)
    i, j, pairs = n, m, {}
    while i > 0 and j > 0:
        if abs(S[i][j] - (S[i-1][j-1] + sim(i-1, j-1) - 0.3)) < 1e-9:
            pairs[i-1] = j-1; i -= 1; j -= 1
        elif abs(S[i][j] - (S[i-1][j] + G)) < 1e-9:
            i -= 1
        else:
            j -= 1
    # One entry per script word, in script order. Matched words keep Whisper's times;
    # script words Whisper merged or missed get "est": true and a time inside the gap
    # between their real matched neighbours (split evenly). Never used for heard words.
    inv = {j: k for k, j in pairs.items()}
    out = []
    for j, sw in enumerate(script_words):
        if j in inv:
            w = words[inv[j]]
            out.append({"word": _strip(sw), "start": w["start"], "end": w["end"], "heard": w["word"]})
        else:
            out.append({"word": _strip(sw), "start": None, "end": None, "est": True})
    j = 0
    while j < len(out):
        if out[j].get("est"):
            k = j
            while k < len(out) and out[k].get("est"): k += 1
            lo = out[j-1]["end"] if j > 0 else 0.0
            hi = out[k]["start"] if k < len(out) else (out[j-1]["end"] + 0.4 * (k - j))
            if hi < lo: hi = lo
            step = (hi - lo) / (k - j)
            for q in range(j, k):
                out[q]["start"] = round(lo + step * (q - j), 3); out[q]["end"] = round(lo + step * (q - j + 1), 3)
            j = k
        else:
            j += 1
    return out, len(pairs)


def silence_lines(path, noise="-40dB", min_pause=0.1):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
                          f"silencedetect=n={noise}:d={min_pause}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    dur = duration(path)
    starts = [float(x) for x in re.findall(r"silence_start: ([-0-9.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([-0-9.]+)", err)]
    if len(ends) < len(starts):
        ends.append(dur)
    lines, pos = [], 0.0
    for s, e in zip(starts, ends):
        s = max(0.0, s)
        if s - pos > 0.05:
            lines.append({"start": round(pos, 3), "end": round(s, 3), "text": ""})
        pos = e
    if dur - pos > 0.05:
        lines.append({"start": round(pos, 3), "end": round(dur, 3), "text": ""})
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default=None, help="e.g. hi or en (auto if omitted)")
    ap.add_argument("--script", help="clean script text (one spoken line per row): fixes word spellings (Whisper) or labels lines (fallback)")
    ap.add_argument("--out", default=os.path.join(ROOT, "public", "words.json"))
    ap.add_argument("--fallback", action="store_true", help="skip Whisper, use silencedetect")
    ap.add_argument("--min-pause", type=float, default=0.1)
    a = ap.parse_args()

    out = {"audio": os.path.relpath(os.path.abspath(a.audio), os.path.join(ROOT, "public")),
           "duration": round(duration(a.audio), 3), "words": [], "lines": []}
    try:
        if a.fallback:
            raise RuntimeError("--fallback given")
        out["words"], out["lines"] = whisper_words(a.audio, a.model, a.lang)
        out["source"] = f"whisper-{a.model}"
        if a.script:
            sw = re.sub(r"\[.*?\]", "", open(a.script, encoding="utf8").read()).split()
            out["words"], k = align_to_script(out["words"], sw)
            print(f"aligned {k}/{len(out['words'])} heard words to {len(sw)} script words")
    except Exception as e:  # blocked download, missing package, ...
        print(f"Whisper unavailable ({str(e).splitlines()[0][:160]}); using silencedetect line times.", file=sys.stderr)
        out["source"] = "silencedetect"
        out["lines"] = silence_lines(a.audio, min_pause=a.min_pause)
        if a.script:
            texts = [l.strip() for l in open(a.script, encoding="utf8") if l.strip()]
            if len(texts) == len(out["lines"]):
                for l, t in zip(out["lines"], texts):
                    l["text"] = t
            else:
                print(f"WARNING: script has {len(texts)} lines but audio has {len(out['lines'])} speech stretches; "
                      f"text not attached. Adjust --min-pause.", file=sys.stderr)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{a.out}: source={out['source']}, {len(out['words'])} words, {len(out['lines'])} lines, {out['duration']}s")


if __name__ == "__main__":
    main()
