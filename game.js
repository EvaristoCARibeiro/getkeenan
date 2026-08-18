/**
 * Wires the pure logic in engine.js to the DOM: rendering, input, popups.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "getkeenan.best";

  const el = {
    cells: document.getElementById("cells"),
    tiles: document.getElementById("tiles"),
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    newGame: document.getElementById("new-game"),
    gameOver: document.getElementById("game-over"),
    board: document.getElementById("board"),
    modal: document.getElementById("modal"),
    modalKicker: document.getElementById("modal-kicker"),
    modalPhoto: document.getElementById("modal-photo"),
    modalPhotoImg: document.getElementById("modal-photo-img"),
    modalName: document.getElementById("modal-name"),
    modalFact: document.getElementById("modal-fact"),
    modalButton: document.getElementById("modal-button"),
  };

  let grid;
  let score = 0;
  let best = readBest();
  let tileId = 0;
  let seen; // dorm values whose popup has already fired this run
  let queue = []; // dorms revealed by the current move, waiting to be shown
  let won = false;
  let over = false;

  const nextId = () => ++tileId;

  /** True while a popup or an end screen is blocking play. */
  const isBlocked = () => !el.modal.hidden || won || over;

  // --- persistence ---------------------------------------------------

  function readBest() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch (error) {
      return 0; // private browsing, storage disabled — not worth failing over
    }
  }

  function writeBest(value) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      /* ignore */
    }
  }

  // --- setup ---------------------------------------------------------

  function buildCells() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < Engine.SIZE * Engine.SIZE; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      fragment.appendChild(cell);
    }
    el.cells.appendChild(fragment);
  }

  function newGame() {
    grid = Engine.emptyGrid();
    score = 0;
    tileId = 0;
    seen = new Set([START_VALUE]); // Stanford never gets a popup
    queue = [];
    won = false;
    over = false;

    el.gameOver.hidden = true;
    closeModal();

    nodes.clear();
    el.tiles.textContent = "";

    addRandomTile();
    addRandomTile();

    render();
    updateScores();
  }

  function addRandomTile() {
    const cells = Engine.emptyCells(grid);
    if (!cells.length) return;

    const { r, c } = cells[Math.floor(Math.random() * cells.length)];
    const value = Engine.pickSpawnValue(grid, START_VALUE, WIN_VALUE);

    grid[r][c] = { id: nextId(), value, isNew: true };
  }

  // --- rendering -----------------------------------------------------

  /**
   * DOM nodes are kept across moves and keyed by tile id, so changing a tile's
   * --r/--c lets CSS transition it into place instead of teleporting it.
   */
  const nodes = new Map();
  const SLIDE_MS = 110; // keep in sync with the .tile transition in style.css

  function position(node, r, c) {
    node.style.setProperty("--r", r);
    node.style.setProperty("--c", c);
  }

  function render() {
    const present = new Set();

    for (let r = 0; r < Engine.SIZE; r++) {
      for (let c = 0; c < Engine.SIZE; c++) {
        const tile = grid[r][c];
        if (!tile) continue;
        present.add(tile.id);

        if (tile.mergedFrom) {
          // Slide both source tiles onto the merge square, then retire them
          // once the transition has played out.
          for (const source of tile.mergedFrom) {
            const node = nodes.get(source.id);
            if (!node) continue;
            nodes.delete(source.id);
            position(node, r, c);
            setTimeout(() => node.remove(), SLIDE_MS);
          }
          tile.mergedFrom = null;

          const node = renderTile(tile, r, c, "tile-merged");
          nodes.set(tile.id, node);
          el.tiles.appendChild(node);
          continue;
        }

        const existing = nodes.get(tile.id);
        if (existing) {
          position(existing, r, c);
          continue;
        }

        const node = renderTile(tile, r, c, tile.isNew ? "tile-new" : null);
        tile.isNew = false;
        nodes.set(tile.id, node);
        el.tiles.appendChild(node);
      }
    }

    for (const [id, node] of nodes) {
      if (present.has(id)) continue;
      nodes.delete(id);
      node.remove();
    }
  }

  function renderTile(tile, r, c, animation) {
    const dorm = DORM_BY_VALUE.get(tile.value);

    const node = document.createElement("div");
    node.className = "tile";
    position(node, r, c);
    if (tile.value === WIN_VALUE) node.dataset.win = "true";
    if (animation) node.classList.add(animation);

    const inner = document.createElement("div");
    inner.className = "tile-inner";
    inner.style.setProperty("--tile-color", dorm ? dorm.color : "#888");

    // Abbreviation first so it shows through if the crest fails to load.
    const abbr = document.createElement("span");
    abbr.className = "tile-abbr";
    abbr.textContent = dorm ? dorm.abbr : tile.value;
    inner.appendChild(abbr);

    if (dorm && dorm.crest) {
      const img = document.createElement("img");
      img.className = "tile-crest";
      img.alt = dorm.name;
      img.addEventListener("error", () => img.remove());
      img.src = dorm.crest;
      inner.appendChild(img);
    }

    node.appendChild(inner);
    return node;
  }

  function updateScores() {
    el.score.textContent = score;
    if (score > best) {
      best = score;
      writeBest(best);
    }
    el.best.textContent = best;
  }

  // --- popups --------------------------------------------------------

  /** Records every dorm value created by this move that we have not shown yet. */
  function collectReveals(newGrid) {
    for (const row of newGrid) {
      for (const tile of row) {
        if (!tile || !tile.mergedFrom) continue;
        if (seen.has(tile.value)) continue;

        const dorm = DORM_BY_VALUE.get(tile.value);
        if (!dorm || !dorm.fact) continue;

        seen.add(tile.value);
        queue.push(dorm);
      }
    }

    // Show the smallest first so a cascade reads in order.
    queue.sort((a, b) => a.value - b.value);
  }

  function showNextReveal() {
    if (!queue.length) return false;
    openModal(queue.shift());
    return true;
  }

  function openModal(dorm) {
    const isWin = dorm.value === WIN_VALUE;

    el.modal.classList.toggle("is-win", isWin);
    el.modalKicker.textContent = isWin ? "You got Keenan" : "New dorm unlocked";
    el.modalName.textContent = dorm.name;
    el.modalFact.textContent = dorm.fact;
    el.modalButton.textContent = isWin ? "Play Again" : "Continue";

    if (dorm.photo) {
      el.modalPhoto.hidden = false;
      el.modalPhotoImg.alt = dorm.name;
      el.modalPhotoImg.src = dorm.photo;
    } else {
      el.modalPhoto.hidden = true;
    }

    el.modal.hidden = false;
    el.modalButton.focus();
  }

  function closeModal() {
    el.modal.hidden = true;
    el.modal.classList.remove("is-win");
  }

  /**
   * Dismissing a popup either shows the next queued dorm, restarts after a win,
   * or hands control back to the board.
   */
  function dismissModal() {
    const wasWin = el.modal.classList.contains("is-win");
    closeModal();

    if (wasWin) {
      newGame();
      return;
    }

    if (showNextReveal()) return;
    if (won) return;

    finishTurn();
  }

  // --- turn flow -----------------------------------------------------

  function handleMove(direction) {
    if (isBlocked()) return;

    const result = Engine.move(grid, direction, nextId);
    if (!result.moved) return;

    grid = result.grid;
    score += result.score;

    collectReveals(grid);

    // Winning ends the game, but Keenan's own popup still has to be shown, so
    // the flag is set here and acted on once the queue drains.
    if (Engine.hasValue(grid, WIN_VALUE)) won = true;

    render();
    updateScores();

    if (showNextReveal()) return;

    finishTurn();
  }

  /** Spawns the next tile and checks for a dead board. */
  function finishTurn() {
    if (won || over) return;

    addRandomTile();
    render();

    if (!Engine.canMove(grid)) {
      over = true;
      el.gameOver.hidden = false;
    }
  }

  // --- input ---------------------------------------------------------

  const KEYS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
  };

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (!el.modal.hidden) {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
        event.preventDefault();
        dismissModal();
      }
      return;
    }

    const direction = KEYS[event.key];
    if (!direction) return;

    event.preventDefault();
    handleMove(direction);
  });

  // Touch: a swipe counts once it clears the threshold, and the dominant axis
  // wins so a sloppy diagonal still does something sensible.
  const SWIPE_THRESHOLD = 24;
  let touchStart = null;

  el.board.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true }
  );

  el.board.addEventListener("touchmove", (event) => {
    if (touchStart) event.preventDefault();
  });

  el.board.addEventListener("touchend", (event) => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? "right" : "left");
    } else {
      handleMove(dy > 0 ? "down" : "up");
    }
  });

  el.modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-dismiss]")) dismissModal();
  });

  el.newGame.addEventListener("click", newGame);

  el.gameOver.addEventListener("click", (event) => {
    if (event.target.closest("[data-restart]")) newGame();
  });

  // --- go ------------------------------------------------------------

  buildCells();
  newGame();
})();
