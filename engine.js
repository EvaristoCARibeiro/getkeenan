/**
 * Pure game logic. No DOM, no globals beyond the exported object, so it can be
 * loaded by a <script> tag in the browser and by node for the tests.
 *
 * A cell is either null or a tile object: { id, value }.
 * The grid is a 4x4 array of rows: grid[row][col].
 */
const Engine = (function () {
  const SIZE = 4;

  /** Ratio between the spawn odds of one tile and the next one up. */
  const SPAWN_DECAY = 9;

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function emptyCells(grid) {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!grid[r][c]) cells.push({ r, c });
      }
    }
    return cells;
  }

  function maxValue(grid) {
    let max = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] && grid[r][c].value > max) max = grid[r][c].value;
      }
    }
    return max;
  }

  /**
   * Which values are allowed to spawn right now.
   *
   * The starting tile is always available. Every larger tile unlocks once the
   * board's biggest tile is strictly greater than it — so a 4 only starts
   * appearing after you have built an 8.
   */
  function spawnableValues(grid, startValue, winValue) {
    const values = [startValue];
    for (let v = startValue * 2; v < winValue; v *= 2) {
      if (maxValue(grid) > v) values.push(v);
      else break;
    }
    return values;
  }

  /**
   * Geometric weighting: each successive tile is SPAWN_DECAY times rarer than
   * the one below it. With exactly two unlocked tiles this reproduces vanilla
   * 2048's 90/10 split.
   */
  function spawnWeights(count) {
    const weights = [];
    for (let i = 0; i < count; i++) {
      weights.push(Math.pow(SPAWN_DECAY, count - 1 - i));
    }
    return weights;
  }

  function pickSpawnValue(grid, startValue, winValue, rng) {
    const random = rng || Math.random;
    const values = spawnableValues(grid, startValue, winValue);
    const weights = spawnWeights(values.length);
    const total = weights.reduce((a, b) => a + b, 0);

    let roll = random() * total;
    for (let i = 0; i < values.length; i++) {
      roll -= weights[i];
      if (roll < 0) return values[i];
    }
    return values[0];
  }

  /**
   * Collapse one line toward index 0.
   *
   * `line` is an array of SIZE cells already ordered so that index 0 is the
   * destination-most position. Returns the new line plus the points scored.
   * Tiles created by a merge carry `mergedFrom` so the renderer can animate the
   * two source tiles into place before swapping them out.
   */
  function slideLine(line, nextId) {
    const tiles = line.filter(Boolean);
    const out = [];
    let score = 0;
    let i = 0;

    while (i < tiles.length) {
      const tile = tiles[i];
      const next = tiles[i + 1];

      // A tile merges at most once per move, which is why we consume both
      // sources and jump ahead by two: [2,2,4] becomes [4,4], never [8].
      if (next && next.value === tile.value) {
        const merged = {
          id: nextId(),
          value: tile.value * 2,
          mergedFrom: [tile, next],
        };
        out.push(merged);
        score += merged.value;
        i += 2;
      } else {
        out.push(tile);
        i += 1;
      }
    }

    while (out.length < SIZE) out.push(null);
    return { line: out, score };
  }

  /**
   * Read one line out of the grid, ordered so index 0 is where tiles pile up
   * for the given direction. Returns the coordinates alongside so the caller
   * can write the result straight back.
   */
  function lineCoords(direction, index) {
    const coords = [];
    for (let i = 0; i < SIZE; i++) {
      switch (direction) {
        case "left":
          coords.push({ r: index, c: i });
          break;
        case "right":
          coords.push({ r: index, c: SIZE - 1 - i });
          break;
        case "up":
          coords.push({ r: i, c: index });
          break;
        case "down":
          coords.push({ r: SIZE - 1 - i, c: index });
          break;
      }
    }
    return coords;
  }

  function move(grid, direction, nextId) {
    const next = emptyGrid();
    let score = 0;
    let moved = false;

    for (let index = 0; index < SIZE; index++) {
      const coords = lineCoords(direction, index);
      const before = coords.map(({ r, c }) => grid[r][c]);
      const result = slideLine(before, nextId);

      score += result.score;
      for (let i = 0; i < SIZE; i++) {
        const { r, c } = coords[i];
        next[r][c] = result.line[i];
        if (before[i] !== result.line[i]) moved = true;
      }
    }

    return { grid: next, score, moved };
  }

  function canMove(grid) {
    if (emptyCells(grid).length > 0) return true;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const value = grid[r][c].value;
        if (c + 1 < SIZE && grid[r][c + 1].value === value) return true;
        if (r + 1 < SIZE && grid[r + 1][c].value === value) return true;
      }
    }
    return false;
  }

  function hasValue(grid, value) {
    return grid.some((row) => row.some((cell) => cell && cell.value === value));
  }

  return {
    SIZE,
    SPAWN_DECAY,
    emptyGrid,
    emptyCells,
    maxValue,
    spawnableValues,
    spawnWeights,
    pickSpawnValue,
    slideLine,
    lineCoords,
    move,
    canMove,
    hasValue,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Engine;
}
