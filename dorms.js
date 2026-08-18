/**
 * Every dorm-specific thing lives here.
 * To change a joke, a crest, or a photo, edit this file only — game.js never
 * needs to know which halls exist.
 *
 *   value  tile value (powers of two, 2 -> 2048)
 *   name   display name in the popup header
 *   abbr   fallback shown on the tile when the crest image is missing
 *   color  fallback tile background when the crest image is missing
 *   crest  square logo drawn ON the game tile
 *   photo  real photograph of the building, shown in the popup
 *   fact   popup body text
 */
const DORMS = [
  {
    value: 2,
    name: "Stanford Hall",
    abbr: "STAN",
    color: "#1b3a6b",
    crest: "assets/crests/stanford.svg",
    photo: "assets/photos/stanford.jpg",
    fact: null, // starting tile — never shows a popup
  },
  {
    value: 4,
    name: "Knott Hall",
    abbr: "KNOTT",
    color: "#6b7280",
    crest: "assets/crests/knott.svg",
    photo: "assets/photos/knott.jpg",
    fact:
      "Knott Hall is a building on the campus of the University of Notre Dame. " +
      "It has residents. They are, presumably, people. We reached out to Knott " +
      "Hall for comment, and no one else at this university could confirm that " +
      "it exists.",
  },
  {
    value: 8,
    name: "Breen-Phillips Hall",
    abbr: "BP",
    color: "#e11d48",
    crest: "assets/crests/breen-phillips.svg",
    photo: "assets/photos/breen-phillips.jpg",
    fact:
      "Trust me, do NOT leave your food near them. I heard a BP girl ate her " +
      "boyfriend during finals because Grab 'n Go was closed.",
  },
  {
    value: 16,
    name: "McGlinn Hall",
    abbr: "MCG",
    color: "#c79a2e",
    crest: "assets/crests/mcglinn.svg",
    photo: "assets/photos/mcglinn.jpg",
    fact:
      "Well, not a lot to say about them. Don't ask them about the Main " +
      "Building, though — I hear they know a different Golden Dome than we do.",
  },
  {
    value: 32,
    name: "Badin Hall",
    abbr: "BADIN",
    color: "#7c3aed",
    crest: "assets/crests/badin.svg",
    photo: "assets/photos/badin.jpg",
    fact:
      "MAGNETS! My freshman roommate got his braces removed one day just " +
      "walking by Badin. No one understands the electromagnetic field these " +
      "girls are putting out.",
  },
  {
    value: 64,
    name: "Flaherty Hall",
    abbr: "FLA",
    color: "#16a34a",
    crest: "assets/crests/flaherty.svg",
    photo: "assets/photos/flaherty.jpg",
    fact:
      "Flaherty opened in 2016 and developed a funny smell by 2017. Their " +
      "mascot is the Phoenix, which is definitely not a coincidence if you " +
      "know what these stoners are up to.",
  },
  {
    value: 128,
    name: "St. Edward's Hall",
    abbr: "ST. ED'S",
    color: "#0e7490",
    crest: "assets/crests/st-edwards.svg",
    photo: "assets/photos/st-edwards.jpg",
    fact:
      "The oldest hall on campus and, somehow, the shortest. They call " +
      "themselves the Gentlemen; they are, on average, five foot four of pure " +
      "Gentleman.",
  },
  {
    value: 256,
    name: "Carroll Hall",
    abbr: "CARR",
    color: "#b45309",
    crest: "assets/crests/carroll.svg",
    photo: "assets/photos/carroll.jpg",
    fact:
      "Carroll Hall is so close to campus that residents cross four time zones " +
      "on their way to class. Can't lie, though, their proximity to Saint " +
      "Mary's is clutch.",
  },
  {
    value: 512,
    name: "Siegfried Hall",
    abbr: "SIGGY",
    color: "#db2777",
    crest: "assets/crests/siegfried.svg",
    photo: "assets/photos/siegfried.jpg",
    fact:
      "My lawyer didn't allow me to elaborate on this one… Home of Siggy Day, " +
      "an annual event in which two hundred men attempt to convince Notre Dame " +
      "that Siegfried has a “personality.” Those neon tank tops are " +
      "saying a different thing…",
  },
  {
    value: 1024,
    name: "Johnson Family Hall",
    abbr: "JFAM",
    color: "#4338ca",
    crest: "assets/crests/johnson-family.svg",
    photo: "assets/photos/johnson-family.jpg",
    fact:
      "A JFam girl has never allowed the fact that she lives in a palace to go " +
      "unmentioned in a conversation. Ask one about her dorm and clear your " +
      "afternoon.",
  },
  {
    value: 2048,
    name: "Keenan Hall",
    abbr: "KEENAN",
    color: "#0c2340",
    crest: "assets/crests/keenan.svg",
    photo: "assets/photos/keenan.jpg",
    fact:
      "The greatest residence hall in the history of the University of Notre " +
      "Dame and the winningest Hall of the Year. The only dorm brave enough to " +
      "strip in front of 8,000 people annually!\n\n" +
      "You've done it. You've gotten Keenan. There is nothing above this. " +
      "There never was.",
  },
];

const DORM_BY_VALUE = new Map(DORMS.map((d) => [d.value, d]));
const START_VALUE = DORMS[0].value;
const WIN_VALUE = DORMS[DORMS.length - 1].value;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DORMS, DORM_BY_VALUE, START_VALUE, WIN_VALUE };
}
