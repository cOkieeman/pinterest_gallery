import { app } from "../../scripts/app.js";

const CSS = `
.pinterest-gallery-wrap {
  --pg-accent:#d85b68;
  --pg-accent-soft:rgba(216,91,104,.18);
  --pg-surface:var(--comfy-input-bg,#252528);
  --pg-surface-raised:rgba(255,255,255,.055);
  --pg-border:var(--border-color,#4b4b50);
  --pg-text:var(--input-text,#f2f2f3);
  --pg-muted:var(--descrip-text,#aaaab0);
  display:flex;
  flex-direction:column;
  gap:8px;
  width:100%;
  height:100%;
  padding:2px;
  box-sizing:border-box;
  color:var(--pg-text);
  font:500 12px/1.35 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.pinterest-gallery-mode-switch {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:3px;
  padding:3px;
  border:1px solid var(--pg-border);
  border-radius:9px;
  background:rgba(0,0,0,.18);
}
.pinterest-gallery-mode-button {
  min-width:0;
  height:28px;
  padding:0 10px;
  border:0;
  border-radius:6px;
  background:transparent;
  color:var(--pg-muted);
  font:inherit;
  font-size:11px;
  font-weight:600;
  cursor:pointer;
  transition:background-color 160ms ease,color 160ms ease,transform 120ms ease;
}
.pinterest-gallery-mode-button:hover { color:var(--pg-text); background:var(--pg-surface-raised); }
.pinterest-gallery-mode-button:active { transform:translateY(1px); }
.pinterest-gallery-mode-button.active {
  color:#fff;
  background:var(--pg-accent);
  box-shadow:0 1px 5px rgba(77,20,28,.28);
}
.pinterest-gallery-mode-button:focus-visible,
.pinterest-gallery-board:focus-visible,
.pinterest-gallery-search:focus-visible {
  outline:2px solid var(--pg-accent);
  outline-offset:2px;
}
.pinterest-gallery-board,
.pinterest-gallery-search {
  min-width:0;
  width:100%;
  height:32px;
  padding:0 10px;
  box-sizing:border-box;
  border:1px solid var(--pg-border);
  border-radius:7px;
  background:var(--pg-surface);
  color:var(--pg-text);
  font:inherit;
  font-size:12px;
  font-weight:500;
  transition:border-color 160ms ease,box-shadow 160ms ease;
}
.pinterest-gallery-search::placeholder { color:var(--pg-muted); }
.pinterest-gallery-board:hover,
.pinterest-gallery-search:hover { border-color:color-mix(in srgb,var(--pg-border),#fff 24%); }
.pinterest-gallery-board:disabled { cursor:not-allowed; opacity:.55; }
.pinterest-gallery-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(82px,1fr));
  gap:6px;
  grid-auto-rows:min-content;
  align-content:start;
  flex:1 1 auto;
  min-height:0;
  max-height:75vh;
  overflow-y:auto;
  padding:6px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:9px;
  background:rgba(0,0,0,.2);
  scrollbar-color:var(--pg-border) transparent;
}
.pinterest-gallery-item {
  position:relative;
  width:100%;
  aspect-ratio:4/5;
  padding:0;
  overflow:hidden;
  cursor:pointer;
  border:1px solid transparent;
  border-radius:7px;
  background:var(--pg-surface);
  box-shadow:0 1px 4px rgba(0,0,0,.16);
  transition:border-color 160ms ease,box-shadow 160ms ease,transform 160ms ease;
}
.pinterest-gallery-item:hover { transform:translateY(-1px); box-shadow:0 4px 10px rgba(0,0,0,.24); }
.pinterest-gallery-item:active { transform:scale(.985); }
.pinterest-gallery-item:focus-visible { outline:2px solid var(--pg-accent); outline-offset:2px; }
.pinterest-gallery-item.selected { border-color:var(--pg-accent); box-shadow:0 0 0 2px var(--pg-accent-soft); }
.pinterest-gallery-thumb { width:100%; height:100%; object-fit:cover; display:block; }
.pinterest-gallery-selected-mark {
  position:absolute;
  top:6px;
  right:6px;
  display:grid;
  place-items:center;
  width:20px;
  height:20px;
  border-radius:50%;
  color:#fff;
  background:var(--pg-accent);
  box-shadow:0 2px 6px rgba(0,0,0,.32);
  opacity:0;
  transform:scale(.72);
  transition:opacity 160ms ease,transform 160ms ease;
}
.pinterest-gallery-item.selected .pinterest-gallery-selected-mark { opacity:1; transform:scale(1); }
.pinterest-gallery-status {
  display:none;
  padding:7px 9px;
  border-radius:7px;
  color:var(--pg-muted);
  background:var(--pg-surface-raised);
  font-size:11px;
  text-wrap:pretty;
}
.pinterest-gallery-status.visible { display:block; }
.pinterest-gallery-status.error { color:#ffb7bd; background:rgba(216,91,104,.13); }
.pinterest-gallery-status.loading::before {
  content:"";
  display:inline-block;
  width:6px;
  height:6px;
  margin-right:7px;
  border-radius:50%;
  background:var(--pg-accent);
  animation:pinterest-gallery-pulse 900ms ease-in-out infinite alternate;
}
.pinterest-gallery-sentinel { grid-column:1/-1; height:1px; }
@keyframes pinterest-gallery-pulse { to { opacity:.35; transform:scale(.75); } }
@media (prefers-reduced-motion:reduce) {
  .pinterest-gallery-mode-button,
  .pinterest-gallery-item,
  .pinterest-gallery-selected-mark { transition:none; }
  .pinterest-gallery-status.loading::before { animation:none; }
}
`;

function injectCss() {
  if (document.getElementById("pinterest-gallery-css")) return;
  const style = document.createElement("style");
  style.id = "pinterest-gallery-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

app.registerExtension({
  name: "pinterest_gallery.widget",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "PinterestGalleryLoader") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onNodeCreated?.apply(this, arguments);
      injectCss();

      const node = this;
      const selectedWidget = node.widgets.find((w) => w.name === "selected_pin");
      if (selectedWidget) {
        selectedWidget.computeSize = () => [0, -4];
        selectedWidget.draw = () => {};
      }

      const wrap = document.createElement("div");
      wrap.className = "pinterest-gallery-wrap";
      const modeSwitch = document.createElement("div");
      modeSwitch.className = "pinterest-gallery-mode-switch";
      const searchModeButton = document.createElement("button");
      searchModeButton.type = "button";
      searchModeButton.className = "pinterest-gallery-mode-button active";
      searchModeButton.textContent = "Search";
      searchModeButton.ariaPressed = "true";
      const boardsModeButton = document.createElement("button");
      boardsModeButton.type = "button";
      boardsModeButton.className = "pinterest-gallery-mode-button";
      boardsModeButton.textContent = "My Boards";
      boardsModeButton.ariaPressed = "false";
      modeSwitch.append(searchModeButton, boardsModeButton);
      const boardSelect = document.createElement("select");
      boardSelect.className = "pinterest-gallery-board";
      boardSelect.disabled = true;
      boardSelect.innerHTML = '<option value="">Select a board...</option>';
      boardSelect.ariaLabel = "Pinterest Board";
      const input = document.createElement("input");
      input.className = "pinterest-gallery-search";
      input.type = "text";
      input.placeholder = "Search Pinterest...";
      input.ariaLabel = "Search Pinterest";
      input.addEventListener("keydown", (e) => e.stopPropagation());
      boardSelect.addEventListener("keydown", (e) => e.stopPropagation());

      const status = document.createElement("div");
      status.className = "pinterest-gallery-status";
      const grid = document.createElement("div");
      grid.className = "pinterest-gallery-grid";
      const sentinel = document.createElement("div");
      sentinel.className = "pinterest-gallery-sentinel";
      grid.appendChild(sentinel);
      wrap.append(modeSwitch, input, boardSelect, status, grid);

      let mode = "search";
      let currentQuery = "";
      let currentBoard = "";
      let bookmark = null;
      let loading = false;
      let debounceTimer = null;
      let requestGeneration = 0;
      let activeController = null;

      const cancelActiveRequest = () => {
        activeController?.abort();
        activeController = null;
        loading = false;
      };

      const startRequest = () => {
        const controller = new AbortController();
        activeController = controller;
        loading = true;
        return controller;
      };

      const finishRequest = (controller) => {
        if (activeController !== controller) return;
        activeController = null;
        loading = false;
      };

      const setStatus = (message, tone = "neutral") => {
        status.textContent = message;
        status.className = `pinterest-gallery-status${message ? " visible" : ""}${tone === "neutral" ? "" : ` ${tone}`}`;
      };

      const clearResults = () => {
        grid.querySelectorAll(".pinterest-gallery-item").forEach((el) => el.remove());
        bookmark = null;
      };

      const selectedId = () => {
        try {
          return JSON.parse(selectedWidget?.value || "{}").id;
        } catch {
          return null;
        }
      };

      const setSelected = (item, itemEl) => {
        grid.querySelectorAll(".pinterest-gallery-item.selected").forEach((el) => el.classList.remove("selected"));
        itemEl.classList.add("selected");
        if (selectedWidget) {
          selectedWidget.value = JSON.stringify({ id: item.id, image_url: item.image_url });
          node.setDirtyCanvas?.(true, true);
        }
      };

      const addItems = (items) => {
        for (const item of items) {
          if (!item?.thumbnail_url || !item?.image_url) continue;
          const itemButton = document.createElement("button");
          itemButton.type = "button";
          itemButton.className = `pinterest-gallery-item${String(item.id) === String(selectedId()) ? " selected" : ""}`;
          itemButton.title = "Select this Pin";
          itemButton.ariaLabel = `Select Pinterest Pin ${item.id}`;
          const img = document.createElement("img");
          img.className = "pinterest-gallery-thumb";
          img.src = item.thumbnail_url;
          img.loading = "lazy";
          img.alt = `Pinterest Pin ${item.id}`;
          const selectedMark = document.createElement("span");
          selectedMark.className = "pinterest-gallery-selected-mark";
          selectedMark.textContent = "✓";
          selectedMark.ariaHidden = "true";
          itemButton.append(img, selectedMark);
          itemButton.addEventListener("click", () => setSelected(item, itemButton));
          grid.insertBefore(itemButton, sentinel);
        }
      };

      const request = async (url, options, signal) => {
        const resp = await fetch(url, { ...(options || {}), signal });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Pinterest request failed");
        return data;
      };

      const requestItems = async (url, options, generation, emptyMessage) => {
        if (loading) return;
        const controller = startRequest();
        setStatus("Loading Pins…", "loading");
        try {
          const data = await request(url, options, controller.signal);
          if (generation !== requestGeneration) return;
          addItems(data.items || []);
          bookmark = data.bookmark || null;
          const hasItems = grid.querySelectorAll(".pinterest-gallery-item").length > 0;
          setStatus(data.items?.length || hasItems ? "" : emptyMessage);
        } catch (err) {
          if (err.name === "AbortError") return;
          if (generation === requestGeneration) {
            setStatus(err.message || "Pinterest request failed", "error");
            bookmark = null;
          }
        } finally {
          finishRequest(controller);
        }
      };

      const runSearch = (query, nextBookmark, generation) => requestItems(
        "/pinterest_gallery/search",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, bookmark: nextBookmark }) },
        generation,
        "No results"
      );

      const runBoardPins = (boardId, nextBookmark, generation) => {
        if (!boardId) return;
        const suffix = nextBookmark ? `?bookmark=${encodeURIComponent(nextBookmark)}` : "";
        return requestItems(`/pinterest_gallery/boards/${encodeURIComponent(boardId)}/pins${suffix}`, undefined, generation, "No pins found");
      };

      const loadBoards = async (generation) => {
        if (loading) return;
        const controller = startRequest();
        setStatus("Loading Boards…", "loading");
        boardSelect.disabled = true;
        try {
          const boards = [];
          const seenBookmarks = new Set();
          let nextBookmark = null;
          do {
            const suffix = nextBookmark ? `?bookmark=${encodeURIComponent(nextBookmark)}` : "";
            const data = await request(`/pinterest_gallery/boards${suffix}`, undefined, controller.signal);
            if (generation !== requestGeneration) return;
            boards.push(...(data.items || []));
            nextBookmark = data.bookmark || null;
            if (nextBookmark && seenBookmarks.has(nextBookmark)) break;
            if (nextBookmark) seenBookmarks.add(nextBookmark);
          } while (nextBookmark);

          boardSelect.innerHTML = '<option value="">Select a board...</option>';
          for (const board of boards) {
            const option = document.createElement("option");
            option.value = board.id;
            const count = Number.isFinite(board.pin_count) ? ` · ${board.pin_count} Pins` : "";
            option.textContent = `${board.name || board.id}${count}`;
            boardSelect.appendChild(option);
          }
          boardSelect.disabled = false;
          setStatus(boards.length ? "Choose a Board to view its Pins." : "No Boards found.");
        } catch (err) {
          if (err.name === "AbortError") return;
          if (generation === requestGeneration) setStatus(err.message || "Unable to load Boards", "error");
        } finally {
          finishRequest(controller);
        }
      };

      const switchMode = (nextMode) => {
        if (nextMode === mode) return;
        cancelActiveRequest();
        clearTimeout(debounceTimer);
        mode = nextMode;
        requestGeneration += 1;
        currentQuery = "";
        currentBoard = "";
        clearResults();
        setStatus("");
        input.value = "";
        searchModeButton.className = `pinterest-gallery-mode-button${mode === "search" ? " active" : ""}`;
        boardsModeButton.className = `pinterest-gallery-mode-button${mode === "boards" ? " active" : ""}`;
        searchModeButton.ariaPressed = mode === "search" ? "true" : "false";
        boardsModeButton.ariaPressed = mode === "boards" ? "true" : "false";
        input.style.display = mode === "search" ? "block" : "none";
        boardSelect.style.display = mode === "boards" ? "block" : "none";
        if (mode === "boards") loadBoards(requestGeneration);
        else setStatus("Type a keyword to search Pinterest.");
      };

      searchModeButton.addEventListener("click", () => switchMode("search"));
      boardsModeButton.addEventListener("click", () => switchMode("boards"));

      boardSelect.addEventListener("change", () => {
        cancelActiveRequest();
        currentBoard = boardSelect.value;
        requestGeneration += 1;
        clearResults();
        setStatus("");
        if (currentBoard) runBoardPins(currentBoard, null, requestGeneration);
        else setStatus("Choose a Board to view its Pins.");
      });

      input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();
        debounceTimer = setTimeout(() => {
          if (!query || query === currentQuery || mode !== "search") return;
          cancelActiveRequest();
          requestGeneration += 1;
          currentQuery = query;
          clearResults();
          runSearch(query, null, requestGeneration);
        }, 500);
      });

      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || !bookmark || loading) return;
        if (mode === "search" && currentQuery) runSearch(currentQuery, bookmark, requestGeneration);
        if (mode === "boards" && currentBoard) runBoardPins(currentBoard, bookmark, requestGeneration);
      }, { root: grid });
      observer.observe(sentinel);

      boardSelect.style.display = "none";
      setStatus("Type a keyword to search Pinterest.");
      node.addDOMWidget("pinterest_gallery_ui", "div", wrap, { serialize: false });
      requestAnimationFrame(() => {
        let [w, h] = node.size;
        w = Math.max(w, 320);
        if (h < 300 || h > 560) h = 380;
        node.setSize([w, h]);
        node.setDirtyCanvas?.(true, true);
      });
      const onRemoved = node.onRemoved;
      node.onRemoved = function () {
        clearTimeout(debounceTimer);
        cancelActiveRequest();
        observer.disconnect();
        onRemoved?.apply(this, arguments);
      };
    };
  },
});
