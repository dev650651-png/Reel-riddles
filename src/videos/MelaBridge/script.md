# MelaBridge: script (Part 1)

- **Status:** script written, waiting for the voice file. No audio generated.
- **Reference:** refs/reel1.mp4 (from main: reel1.mp4; not committed). We take only the idea and the logic.
- **Voice language:** Hindi (Devanagari for ElevenLabs). On-screen text is Roman capitals only.
- **Handle:** @daily.riddles.12
- **Length:** 110 words, 9 lines. Estimated 36-38 s after clean_voice, plus a 2 s tail (check against the real voice).

## Reference study (5 lines)
1. **Idea:** a prisoner escapes over a long rope bridge at night; freedom is on the far side, crocodiles are below.
2. **Rules:** crossing takes 10 min. A guard at the start comes out every 5 min and sends anyone he sees on the bridge back.
   No running (the bridge breaks), no hiding, no fighting.
3. **Answer:** walk for just under 5 min, then turn and walk toward the guard. He thinks you're coming from the far side and
   "sends you back" there.
   **Weak spots in the reference:**
   - The prisoner wears a striped uniform marked YOU, so a real guard would know which side he came from.
   - After the turn at about 5 min he still needs about 5 min more, so he arrives at exactly 10 min, when the guard looks again.
4. **Hook:** opens mid-bridge ("HALFWAY ACROSS", timer 00:00), then rewinds to explain.
5. **Format:** 40 s, night, open question with no A-D options ("COMMENT YOUR PLAN"), "PART 2 THIS EVENING", Follow tap.

## Made our own
- **Setting:** a sunny Indian village. A mela with a Ferris wheel, balloons and stalls sits across a river; an old wooden
  footbridge is closed for repairs. Daytime, no jail, no crocodiles.
- **Characters:**
  - **Pappu** in his yellow kurta. Ordinary clothes, so nobody can tell which side he came from.
  - **Ramlal Kaka**, the chowkidar: thin, white moustache, khaki uniform, lathi, glasses. He sits in a small tin-roof
    chowki with a wall clock, comes out every 5 min, and blows a whistle.
- **Numbers:** bridge 8 min, look-out every 5 min. 8 instead of 10 fixes the reference's timing problem.
- **Question format:** our A-D tiles instead of an open question.

## Script with part labels

| # | Part | Voice (Hindi) | Meaning | Picture |
|---|------|---------------|---------|---------|
| 1 | HOOK | [excited] आठ मिनट का पुल, हर पाँच मिनट चौकीदार, पप्पू मेले पहुँचेगा कैसे? | An 8-minute bridge, a guard every 5 minutes: how will Pappu reach the mela? | Frame 0: Pappu mid-step on the swaying bridge; a big clock-chip ticks; Kaka's door is bursting open. |
| 2 | BODY | [curious] नदी पार मेला है, पर पुल बंद है। | The mela is across the river, but the bridge is closed. | Wide: river, mela on the far bank (Ferris wheel turning); a "BAND" barrier swings shut. |
| 3 | BODY | पुल पार करने में, आठ मिनट लगते हैं। | Crossing the bridge takes eight minutes. | Bridge side view; a progress bar from start to mela fills; stopwatch shows 8:00. |
| 4 | BODY | किनारे पर रामलाल काका, हर पाँच मिनट में, बाहर झाँकते हैं। | On the bank, Ramlal Kaka looks out every five minutes. | Cut to the chowki: Kaka pops out of the door on "झाँकते", glasses glint; the clock hand jumps 5 min. |
| 5 | BODY | पुल पर जो दिखे, वो जिधर से आया, उधर वापस भेज देते हैं। | Whoever he sees on the bridge, he sends back the way they came. | A test villager on the bridge gets whistled and walks back the way he came; big arrow back. |
| 6 | RE-HOOK | [dramatically] भागा तो पुल चरमराएगा, छुपने की जगह नहीं, तो पप्पू क्या करे? | Run and the bridge creaks; nowhere to hide. So what should Pappu do? | Planks crack on "चरमराएगा" (shake, dust); Pappu looks around; slam "PAPPU KYA KARE?". |
| 7 | FINAL BODY | ए, काका के अंदर जाते ही चलो। बी, पाँच मिनट से ठीक पहले, पलट कर काका की तरफ़ चलो। सी, पाँच मिनट चलो, फिर लौटो। डी, पूरी ताक़त से भागो। | A: start the moment Kaka goes in. B: just before 5 min, turn and walk toward Kaka. C: walk 5 min, then come back. D: run with all your strength. | A-D tiles pop on each letter; Pappu's eyes follow each tile. |
| 8 | CLIFFHANGER | [curious] सोच कर, जवाब कमेंट में लिखो। | Think, and write your answer in the comments. | Tiles wobble; comment bubble bounces. |
| 9 | CLIFFHANGER | [excited] सही जवाब, अगली रील में, फ़ॉलो करो, डेली रिडल्स ट्वेल्व। | Right answer in the next reel, follow daily riddles twelve. | Locked "?" box, "ANSWER NEXT REEL", hand taps FOLLOW. |

## Clean text for ElevenLabs (no labels)

```
[excited] आठ मिनट का पुल, हर पाँच मिनट चौकीदार, पप्पू मेले पहुँचेगा कैसे?
[curious] नदी पार मेला है, पर पुल बंद है।
पुल पार करने में, आठ मिनट लगते हैं।
किनारे पर रामलाल काका, हर पाँच मिनट में, बाहर झाँकते हैं।
पुल पर जो दिखे, वो जिधर से आया, उधर वापस भेज देते हैं।
[dramatically] भागा तो पुल चरमराएगा, छुपने की जगह नहीं, तो पप्पू क्या करे?
ए, काका के अंदर जाते ही चलो। बी, पाँच मिनट से ठीक पहले, पलट कर काका की तरफ़ चलो। सी, पाँच मिनट चलो, फिर लौटो। डी, पूरी ताक़त से भागो।
[curious] सोच कर, जवाब कमेंट में लिखो।
[excited] सही जवाब, अगली रील में, फ़ॉलो करो, डेली रिडल्स ट्वेल्व।
```

## On-screen chips (Roman capitals, 2-4 words)
| On word (line) | Chip |
|---|---|
| frame 0 (title) | 8 MIN KA PUL |
| frame 0 (title) | MELA KAISE PAHUNCHE? |
| बंद (2) | PUL BAND HAI |
| आठ मिनट (3) | CROSSING: 8 MIN |
| पाँच मिनट (4) | HAR 5 MIN: KAKA |
| वापस (5) | JIDHAR SE AAYA, WAPAS |
| चरमराएगा (6) | BHAAGE TO CHARR! |
| क्या करे (6) | PAPPU KYA KARE? (slam) |
| ए/बी/सी/डी (7) | A) TURANT CHALO · B) PALAT KE KAKA KI OR · C) 5 MIN, PHIR LAUTO · D) PURI TAAQAT SE BHAAGO |
| कमेंट (8) | COMMENT KARO |
| अगली रील (9) | ANSWER NEXT REEL |
| फ़ॉलो (9) | FOLLOW @DAILY.RIDDLES.12 |

## Frame 0
Already moving: Pappu is mid-step in the middle of the swaying rope-and-plank bridge (the bridge bounces under his foot, with
the river sparkling below and the mela's Ferris wheel turning on the far bank). On the near bank Kaka's chowki door is bursting
open with a dust puff, and his whistle is at his lips. Title **8 MIN KA PUL** and **MELA KAISE PAHUNCHE?** are in the upper
third from frame 0, clear of faces, the bottom 300 px and the right edge. A whistle-ish ding plus a whoosh play at 0 s.

## Right answer (do NOT show or say it in Part 1)
**B: just before 5 minutes, turn round and walk toward Kaka.**
- Pappu starts the moment Kaka goes in (t = 0). He walks toward the mela until about 4:50, then turns and walks a few steps
  back toward Kaka.
- At 5:00 Kaka looks out and sees a man in ordinary clothes walking *toward* the chowki, so he thinks the man came from the
  mela side and "sends him back" that way.
- Pappu has about 4.7 of the 8 minutes behind him, so about 3.3 min remain. He reaches the mela at about 8:20, before Kaka's
  next look at 10:00.

Why the wrong options are tempting:
- **A (start right after Kaka goes in):** good timing, but 8 > 5. At 5:00 he is only 5/8 across, walking toward the mela, so he is sent back.
- **C (walk 5 min, then come back):** people half-remember the trick, but walking back for real just returns him to the start.
- **D (run):** careless. The rules say the bridge creaks and breaks.

## Our logic fixes vs the reference
- **Uniform:** ordinary clothes, so Kaka can't tell which side Pappu came from (the reference's striped prison uniform gives it away).
- **Timing:** 8 min instead of 10 means Pappu is off the bridge before the next look. With 10 min he would arrive exactly at the next look.
