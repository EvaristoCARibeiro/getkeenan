# Get Keenan

A 2048-style game for the residence halls of the University of Notre Dame.
Combine dorms to reach the almighty **Keenan**.

**[▶ Play it](https://keenan.evaristocaribeiro.com)**

## How to play

Arrow keys or WASD on a computer, swipe on a phone. Standard 2048 rules on a
4×4 board, with two twists:

- **Only Stanford spawns at first.** Every bigger dorm unlocks as a spawn once
  the board's largest tile passes it (a Knott only starts appearing after).
  you've built a Breen-Phillips.
- **Each unlocked dorm is 9× rarer than the one below it**, which reproduces
  vanilla 2048's 90/10 split. The tail self-limits: by the time Siegfried can
  spawn, it's about a 1-in-43-million roll.

The first time you make a given dorm, the board freezes and a popup shows its
photo and fun fact. It only fires once per game.

## The ladder

| Tile | Hall | | Tile | Hall |
| --- | --- | --- | --- | --- |
| 2 | Stanford | | 128 | St. Edward's |
| 4 | Knott | | 256 | Carroll |
| 8 | Breen-Phillips | | 512 | Siegfried |
| 16 | McGlinn | | 1024 | Johnson Family |
| 32 | Badin | | 2048 | **Keenan** |
| 64 | Flaherty | | | |

## Project structure

No frameworks and no build step, just plain HTML, CSS, and JavaScript.

| File | What it does |
| --- | --- |
| `dorms.js` | The ladder: every name, colour, crest, photo, and fun fact |
| `engine.js` | Game logic: sliding, merging, spawn rules. No DOM |
| `game.js` | Rendering, input, popups |
| `index.html` / `style.css` | Page and styling |
| `test/engine.test.js` | Engine tests |

## Artwork

Tiles use each hall's coat of arms and popups use a photo of the building, all
from Wikimedia Commons under CC-BY-SA — crests from
[Category:Coat of Arms of the Notre Dame residence halls][arms], photos from
[Category:Residence Halls at the University of Notre Dame][halls]. Per-file
authors and licences are in [`assets/ATTRIBUTION.md`](assets/ATTRIBUTION.md);
keep it with the images if you reuse them.

[arms]: https://commons.wikimedia.org/wiki/Category:Coat_of_Arms_of_the_Notre_Dame_residence_halls
[halls]: https://commons.wikimedia.org/wiki/Category:Residence_Halls_at_the_University_of_Notre_Dame

## Credits

Created by [Evaristo C A Ribeiro](https://www.linkedin.com/in/evaristoribeiro/).
Inspired by [Get MIT](https://mitchgu.github.io/GetMIT/) by Mitchell Gu and
[Get Caltech](https://naveenarun.github.io/GetCaltech/) by Naveen Arun. Based on
[2048](https://play2048.co/) by Gabriele Cirulli and
[1024](https://apps.apple.com/us/app/1024/id823499224) by Veewo Studio, and
conceptually similar to [Threes](https://asherv.com/threes/) by Asher Vollmer.

Dorm jokes in the spirit of [@keenanrevue](https://www.instagram.com/keenanrevue/).
An independent Keenan resident production, not affiliated with or endorsed by the
University of Notre Dame.
