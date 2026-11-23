# MelaAnswer: script (Part 2 of MelaBridge)

- **Status:** voice ready, video not built yet.
  - voice/mela_answer.mp3: eleven_v4, Rohit, 37.6 s, 571 credits. Cleaned: public/voice/mela_answer.wav, 33.6 s, -16.1 LUFS,
    so the video is 35.6 s with the 2 s tail.
  - words.json: 110/110 words (108 heard; पहुँच, पुल estimated). Snapshot in src/videos/MelaAnswer/words.json.
- **Job:** reveal B, play the trick out step by step on the same set (bridge, chowki, Kaka), prove the timing, tease the next riddle.
- **Length:** 110 words, 9 lines. Expected about 35 s after clean_voice, plus a 2 s tail.

## Script with part labels

| # | Part | Voice (Hindi) | Meaning | Picture |
|---|------|---------------|---------|---------|
| 1 | HOOK | [excited] पप्पू मेले पहुँच गया, वो भी काका की मदद से! सही जवाब, बी! | Pappu reached the mela, with Kaka's help! The answer is B! | Frame 0: Pappu mid-jump off the bridge end into the mela, a balloon in hand. Tile B slams down glowing; A, C, D crossed. |
| 2 | BODY | [curious] काका के अंदर जाते ही, पप्पू पुल पर चल पड़ा। | The moment Kaka went inside, Pappu started across. | Rewind wipe; the chowki door shuts; a timer chip starts at 0:00; Pappu steps on. |
| 3 | BODY | चार मिनट पचास सेकंड तक, वो मेले की तरफ़ चलता रहा। | For four minutes fifty seconds he walked toward the mela. | Time-lapse walk to about 60% across; the clock chip races to 4:50. |
| 4 | BODY | फिर ठीक पाँच मिनट से पहले, वो पलटा, और काका की तरफ़ चलने लगा। | Then just before 5 minutes, he turned and walked toward Kaka. | Freeze, then Pappu spins round (squash) and a big U-turn arrow appears; he walks back a few steps. |
| 5 | RE-HOOK | [dramatically] काका बाहर आए, और देखा, कोई उनकी तरफ़ आ रहा है! | Kaka came out and saw someone coming toward him! | Door bursts open (5:00), whistle, shake; slam "KOI AA RAHA HAI!". |
| 6 | FINAL BODY | उन्हें लगा, ये मेले से आया है, तो वापस, मेले की तरफ़ भेज दिया! | He thought this man came from the mela, so he sent him back toward the mela! | Kaka's thought bubble shows the mela; he points the lathi at the mela; Pappu grins and turns again. |
| 7 | FINAL BODY | [excited] बचा था बस तीन मिनट बीस सेकंड का रास्ता, और अगली झाँक से पहले, पप्पू मेले में! | Only 3 min 20 s of bridge was left, and before the next look Pappu was at the mela! | Timer 5:00 to 8:20 with "AGLI JHAANK 10:00" shown; Pappu jumps into the mela; Ferris wheel; confetti. |
| 8 | CLIFFHANGER | [curious] अगली रील में, नई पहेली, सही बताया था? कमेंट करो। | New riddle in the next reel. Did you get it right? Comment. | Mystery box; comment bubble. |
| 9 | CLIFFHANGER | [excited] और ऐसी पहेलियों के लिए, फ़ॉलो करो, डेली रिडल्स ट्वेल्व। | For more riddles like this, follow daily riddles twelve. | Handle chip; hand taps FOLLOW; Pappu waves from the mela. |

## Clean text for ElevenLabs

```
[excited] पप्पू मेले पहुँच गया, वो भी काका की मदद से! सही जवाब, बी!
[curious] काका के अंदर जाते ही, पप्पू पुल पर चल पड़ा।
चार मिनट पचास सेकंड तक, वो मेले की तरफ़ चलता रहा।
फिर ठीक पाँच मिनट से पहले, वो पलटा, और काका की तरफ़ चलने लगा।
[dramatically] काका बाहर आए, और देखा, कोई उनकी तरफ़ आ रहा है!
उन्हें लगा, ये मेले से आया है, तो वापस, मेले की तरफ़ भेज दिया!
[excited] बचा था बस तीन मिनट बीस सेकंड का रास्ता, और अगली झाँक से पहले, पप्पू मेले में!
[curious] अगली रील में, नई पहेली, सही बताया था? कमेंट करो।
[excited] और ऐसी पहेलियों के लिए, फ़ॉलो करो, डेली रिडल्स ट्वेल्व।
```

## On-screen chips (Roman capitals, 2-4 words)
JAWAB: B! (frame 0) · KAKA KI MADAD SE · 0:00 START · 4:50 TAK AAGE · PALAT JAO! · 5:00 KAKA BAHAR (slam) · KOI AA RAHA HAI! ·
"MELE SE AAYA?" · WAPAS MELE KI OR! · BACHA: 3 MIN 20 SEC · 8:20 MELE MEIN! · AGLI JHAANK 10:00 · NAYI PAHELI NEXT ·
SAHI THA? COMMENT KARO · FOLLOW @DAILY.RIDDLES.12

## Frame 0
Already moving: Pappu is mid-jump off the mela end of the bridge with a balloon. The A-D tiles from Part 1 are on screen:
B is mid-slam with a green glow, and red crosses are striking through A, C and D. "JAWAB: B!" and "KAKA KI MADAD SE" are in the
upper third from frame 0, clear of every face. Sound at 0 s: slam, ding and the crowd-ish sparkle.

## Logic check (timeline)
- 0:00 Kaka goes in. Pappu starts. The bridge takes 8:00.
- 0:00 to 4:50: walks toward the mela (4 min 50 s of progress).
- 4:50 to 5:00: walks back toward Kaka for 10 s, so 4 min 40 s of progress remains behind him.
- 5:00 Kaka sees a man walking toward the chowki, assumes he came from the mela, and sends him back toward the mela.
- 5:00 to 8:20: walks the remaining 3 min 20 s and arrives at 8:20, before Kaka's next look at 10:00.
