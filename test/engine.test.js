/**
 * Run with:  node test/engine.test.js
 * No dependencies, no test runner.
 */
const assert = require("assert");
const Engine = require("../engine.js");
const { START_VALUE, WIN_VALUE } = require("../dorms.js");

let idCounter = 0;
const nextId = () => ++idCounter;

/** Build a line from plain numbers; 0 means empty. */
const line = (...values) =>
  values.map((v) => (v === 0 ? null : { id: nextId(), value: v }));

/** Read a line back out as plain numbers. */
const values = (cells) => cells.map((cell) => (cell ? cell.value : 0));

/** Build a grid from rows of numbers. */
const grid = (...rows) => rows.map((row) => line(...row));

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// --- sliding and merging -------------------------------------------------

test("slides tiles toward the front without merging", () => {
  const { line: out } = Engine.slideLine(line(0, 2, 0, 4), nextId);
  assert.deepStrictEqual(values(out), [2, 4, 0, 0]);
});

test("merges a matching pair and scores the result", () => {
  const { line: out, score } = Engine.slideLine(line(2, 2, 0, 0), nextId);
  assert.deepStrictEqual(values(out), [4, 0, 0, 0]);
  assert.strictEqual(score, 4);
});

test("a tile merges at most once per move", () => {
  // The classic 2048 bug: this must be [4,4], never [8].
  const { line: out, score } = Engine.slideLine(line(2, 2, 4, 0), nextId);
  assert.deepStrictEqual(values(out), [4, 4, 0, 0]);
  assert.strictEqual(score, 4);
});

test("four of a kind makes two pairs, not one big tile", () => {
  const { line: out, score } = Engine.slideLine(line(2, 2, 2, 2), nextId);
  assert.deepStrictEqual(values(out), [4, 4, 0, 0]);
  assert.strictEqual(score, 8);
});

test("merges the leading pair first", () => {
  const { line: out } = Engine.slideLine(line(4, 4, 8, 0), nextId);
  assert.deepStrictEqual(values(out), [8, 8, 0, 0]);
});

test("does not merge tiles of different values", () => {
  const { line: out, score } = Engine.slideLine(line(2, 4, 8, 16), nextId);
  assert.deepStrictEqual(values(out), [2, 4, 8, 16]);
  assert.strictEqual(score, 0);
});

test("merged tiles record both sources for animation", () => {
  const { line: out } = Engine.slideLine(line(2, 2, 0, 0), nextId);
  assert.strictEqual(out[0].mergedFrom.length, 2);
});

// --- whole-board moves ---------------------------------------------------

test("moving left collapses every row", () => {
  const before = grid([0, 2, 0, 2], [4, 0, 4, 0], [0, 0, 0, 8], [0, 0, 0, 0]);
  const { grid: after, score, moved } = Engine.move(before, "left", nextId);

  assert.deepStrictEqual(after.map(values), [
    [4, 0, 0, 0],
    [8, 0, 0, 0],
    [8, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assert.strictEqual(score, 12);
  assert.strictEqual(moved, true);
});

test("moving right piles tiles against the far edge", () => {
  const before = grid([2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  const { grid: after } = Engine.move(before, "right", nextId);
  assert.deepStrictEqual(values(after[0]), [0, 0, 0, 4]);
});

test("moving up collapses columns", () => {
  const before = grid([2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]);
  const { grid: after } = Engine.move(before, "up", nextId);
  assert.deepStrictEqual(
    after.map((row) => (row[0] ? row[0].value : 0)),
    [4, 4, 0, 0]
  );
});

test("moving down collapses columns toward the bottom", () => {
  const before = grid([2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  const { grid: after } = Engine.move(before, "down", nextId);
  assert.deepStrictEqual(
    after.map((row) => (row[0] ? row[0].value : 0)),
    [0, 0, 0, 4]
  );
});

test("a move that changes nothing reports moved: false", () => {
  const before = grid([2, 4, 8, 16], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  const { moved } = Engine.move(before, "left", nextId);
  assert.strictEqual(moved, false);
});

// --- spawn unlocking -----------------------------------------------------

test("only the starting tile spawns on a fresh board", () => {
  const board = grid([2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  assert.deepStrictEqual(
    Engine.spawnableValues(board, START_VALUE, WIN_VALUE),
    [2]
  );
});

test("a 4 stays locked while the board's best is only a 4", () => {
  const board = grid([4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  assert.deepStrictEqual(
    Engine.spawnableValues(board, START_VALUE, WIN_VALUE),
    [2]
  );
});

test("a 4 unlocks once an 8 exists", () => {
  const board = grid([8, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  assert.deepStrictEqual(
    Engine.spawnableValues(board, START_VALUE, WIN_VALUE),
    [2, 4]
  );
});

test("unlocks stay contiguous as the board grows", () => {
  const board = grid([64, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  assert.deepStrictEqual(
    Engine.spawnableValues(board, START_VALUE, WIN_VALUE),
    [2, 4, 8, 16, 32]
  );
});

test("the winning tile never becomes spawnable", () => {
  const board = grid([2048, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  const spawnable = Engine.spawnableValues(board, START_VALUE, WIN_VALUE);
  assert.ok(!spawnable.includes(WIN_VALUE));
  assert.strictEqual(spawnable[spawnable.length - 1], 1024);
});

test("two unlocked tiles reproduce vanilla 2048's 90/10 split", () => {
  const weights = Engine.spawnWeights(2);
  const total = weights.reduce((a, b) => a + b, 0);
  assert.strictEqual(weights[0] / total, 0.9);
  assert.ok(Math.abs(weights[1] / total - 0.1) < 1e-9);
});

test("each unlocked tile is 9x rarer than the one below it", () => {
  const weights = Engine.spawnWeights(4);
  for (let i = 1; i < weights.length; i++) {
    assert.strictEqual(weights[i - 1] / weights[i], Engine.SPAWN_DECAY);
  }
});

test("the spawn roll respects the weights it is given", () => {
  const board = grid([8, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  // rng just below the 90% boundary picks the low tile, just above picks the next.
  const low = Engine.pickSpawnValue(board, START_VALUE, WIN_VALUE, () => 0.89);
  const high = Engine.pickSpawnValue(board, START_VALUE, WIN_VALUE, () => 0.91);
  assert.strictEqual(low, 2);
  assert.strictEqual(high, 4);
});

// --- end conditions ------------------------------------------------------

test("a full board with no equal neighbours is game over", () => {
  const board = grid(
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  );
  assert.strictEqual(Engine.canMove(board), false);
});

test("a full board with an adjacent pair is still playable", () => {
  const board = grid(
    [2, 2, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  );
  assert.strictEqual(Engine.canMove(board), true);
});

test("detects the winning tile", () => {
  const board = grid([2048, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]);
  assert.strictEqual(Engine.hasValue(board, WIN_VALUE), true);
});

// --- runner --------------------------------------------------------------

let passed = 0;
const failures = [];

for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`FAIL  ${name}`);
  }
}

console.log(`\n${passed}/${tests.length} passed`);

if (failures.length) {
  for (const { name, error } of failures) {
    console.error(`\n--- ${name} ---\n${error.message}`);
  }
  process.exit(1);
}
