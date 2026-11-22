# ScooterProfit: script (Part 1)

- **Status:** voice ready, video not built yet.
  - `voice/scooter_profit.mp3`: ElevenLabs eleven_v4, voice "Rohit - Calm Hindi Storyteller", 42.6 s.
  - `public/voice/scooter_profit.wav`: after `tools/clean_voice`, 36.4 s, -16.2 LUFS, so the video is 38.4 s with the 2 s tail.
  - `public/words.json`: Whisper small, `--script voice.txt`. 108/108 words timed: 104 heard, 4 estimated (`"est": true`;
    दिया, नौ, सी, दो were merged by Whisper into the next word).
- **Reference:** none (`refs/` does not exist), so this is our own IDEA.
- **IDEA:** a buy-sell-buy-sell profit puzzle. Pappu flips one old scooter four times at a Sunday bazaar. How much profit did he make in total?
- **Voice language:** Hindi (Devanagari for ElevenLabs). On-screen text is Roman capitals only.
- **Handle:** @daily.riddles.12
- **Length:** 108 words, 9 lines. Estimated 33-37 s after `tools/clean_voice`, plus a 2 s tail. Check against the real voice.

## Characters (ours)
- **PAPPU:** young scooter flipper. Big round head, curly hair, yellow kurta, big grin, rupee notes in his shirt pocket.
- **GOLU BHAIYA:** chubby buyer with a moustache, sky-blue checked shirt and helmet, eyes on the scooter.
- **The scooter:** old mint-green scooter with a dented front. It bounces and squashes on every deal.

Setting: a busy Sunday bazaar with stalls, bunting, a chai stall and parked bikes, plus a price board that changes on every deal.

## Script with part labels (for checking)

| # | Part | Voice (Hindi) | Meaning | Picture |
|---|------|---------------|---------|---------|
| 1 | HOOK | [excited] एक स्कूटर, चार सौदे, बताओ पप्पू को कितना फ़ायदा हुआ? | One scooter, four deals: how much profit did Pappu make? | Scooter crashes down into frame with squash and dust; Pappu jumps on. Title already up. |
| 2 | BODY | [curious] संडे बाज़ार में, पप्पू ने एक पुराना स्कूटर ख़रीदा, आठ हज़ार रुपये में। | At the Sunday bazaar, Pappu bought an old scooter for eight thousand. | Bazaar wide shot; Pappu hands over notes; "RS 8,000" tag drops onto the scooter. |
| 3 | BODY | फिर उसने वही स्कूटर, गोलू भैया को बेच दिया, नौ हज़ार में। | Then he sold the same scooter to Golu Bhaiya for nine thousand. | Cut: Golu rides off happily; Pappu counts notes; "RS 9,000" tag. |
| 4 | BODY | [surprised] अगले हफ़्ते, पप्पू ने उसे वापस ख़रीद लिया, दस हज़ार में। | Next week Pappu bought it back for ten thousand. | Calendar page flips; Pappu pays Golu; "RS 10,000" tag. |
| 5 | BODY | और आख़िर में, उसे फिर से बेच दिया, ग्यारह हज़ार रुपये में। | And finally he sold it again for eleven thousand. | Pappu sells to an auntie with a sabzi bag; "RS 11,000" tag; all four tags line up. |
| 6 | RE-HOOK | [dramatically] अब सोचो, पप्पू को कुल कितना फ़ायदा हुआ? | Now think: how much total profit did Pappu make? | Slam: "KUL PROFIT KITNA?" with screen shake; Pappu scratches his head. |
| 7 | FINAL BODY | ए, एक हज़ार। बी, कुछ नहीं, सब बराबर। सी, दो हज़ार। डी, तीन हज़ार। | A: one thousand. B: nothing, it evens out. C: two thousand. D: three thousand. | A-D tiles pop in one by one, each on its letter. |
| 8 | CLIFFHANGER | [curious] ध्यान से सोचना, ज़्यादातर लोग यहीं फँसते हैं, अपना जवाब कमेंट में लिखो। | Think carefully, this is where most people get stuck. Write your answer in the comments. | Tiles wobble; comment-bubble icon bounces. |
| 9 | CLIFFHANGER | [excited] सही जवाब, अगली रील में, ऐसी और पहेलियों के लिए, फ़ॉलो करो, डेली रिडल्स ट्वेल्व। | Right answer in the next reel; for more puzzles like this, follow daily riddles twelve. | "ANSWER NEXT REEL"; a finger taps the FOLLOW button; handle shown. |

## Clean text for ElevenLabs (no labels)

```
[excited] एक स्कूटर, चार सौदे, बताओ पप्पू को कितना फ़ायदा हुआ?
[curious] संडे बाज़ार में, पप्पू ने एक पुराना स्कूटर ख़रीदा, आठ हज़ार रुपये में।
फिर उसने वही स्कूटर, गोलू भैया को बेच दिया, नौ हज़ार में।
[surprised] अगले हफ़्ते, पप्पू ने उसे वापस ख़रीद लिया, दस हज़ार में।
और आख़िर में, उसे फिर से बेच दिया, ग्यारह हज़ार रुपये में।
[dramatically] अब सोचो, पप्पू को कुल कितना फ़ायदा हुआ?
ए, एक हज़ार। बी, कुछ नहीं, सब बराबर। सी, दो हज़ार। डी, तीन हज़ार।
[curious] ध्यान से सोचना, ज़्यादातर लोग यहीं फँसते हैं, अपना जवाब कमेंट में लिखो।
[excited] सही जवाब, अगली रील में, ऐसी और पहेलियों के लिए, फ़ॉलो करो, डेली रिडल्स ट्वेल्व।
```

## On-screen chips (Roman capitals, 2-4 words each)

| On word (line) | Chip |
|---|---|
| frame 0 (title) | 1 SCOOTER, 4 SAUDE |
| frame 0 (title) | KITNA PROFIT? |
| संडे बाज़ार (2) | SUNDAY BAZAAR |
| आठ हज़ार (2) | KHARIDA: RS 8,000 |
| नौ हज़ार (3) | BECHA: RS 9,000 |
| दस हज़ार (4) | WAPAS LIYA: RS 10,000 |
| ग्यारह हज़ार (5) | PHIR BECHA: RS 11,000 |
| कुल (6) | KUL PROFIT KITNA? (slam) |
| ए / बी / सी / डी (7) | Tiles: A) RS 1,000; B) ZERO PROFIT; C) RS 2,000; D) RS 3,000 |
| फँसते (8) | YAHIN FASTE HAIN |
| कमेंट (8) | COMMENT KARO |
| अगली रील (9) | ANSWER NEXT REEL |
| फ़ॉलो (9) | FOLLOW @DAILY.RIDDLES.12 |

"RS" is written instead of the ₹ sign because our Poppins subset may not include ₹. Check this in a still before relying on ₹.

## Frame 0
Already moving: the mint-green scooter has just dropped into frame at the bazaar. It squashes on landing with a dust puff, and Pappu is mid-jump onto the seat with a big grin. Four price tags (8K, 9K, 10K, 11K) spin in the air around him. The title **1 SCOOTER, 4 SAUDE** and **KITNA PROFIT?** sits in the upper third from frame 0, in Poppins 800 with a thick outline, clear of faces, the bottom 300 px and the right edge. Sound starts at 0 s: a thud on the landing plus a whoosh.

## Right answer (do NOT show or say it in Part 1)
**C: RS 2,000 profit.**
- Money out: 8,000 + 10,000 = 18,000. Money in: 9,000 + 11,000 = 20,000. Profit = 20,000 - 18,000 = **2,000**.
- Or treat it as two separate deals: buy 8,000 and sell 9,000 is +1,000; buy 10,000 and sell 11,000 is +1,000; total **+2,000**.

Why the wrong options are tempting:
- **A (1,000):** people treat buying it back at 10,000 after selling at 9,000 as a "1,000 loss" (+1,000 - 1,000 + 1,000). But buying back isn't a loss: that 10,000 is already counted as money spent.
- **B (zero):** people think selling and buying back cancel each other out.
- **D (3,000):** the careless option: 11,000 - 8,000.

## Notes for the build
- All timings come from `public/words.json` after `tools/clean_voice` and `tools/word_times.py --lang hi`.
- Hindi Whisper output may be in Devanagari or romanised, so match the chip words to whatever it returns.
- One deal per scene, so the picture changes every 1-2 s. Use a hard cut with a whoosh between deals, and a "ka-ching" (ding) on every price tag.
