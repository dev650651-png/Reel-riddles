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
    res = model.transcribe(path, word_timestamps=True, language=lang, fp16=False, verbose=False)
    words, lines = [], []
    for seg in res["segments"]:
        lines.append({"start": round(seg["start"], 3), "end": round(seg["end"], 3), "text": seg["text"].strip()})
        for w in seg.get("words", []):
            words.append({"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)})
    return words, lines


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
    ap.add_argument("--script", help="text file, one spoken line per row (used to label fallback lines)")
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
