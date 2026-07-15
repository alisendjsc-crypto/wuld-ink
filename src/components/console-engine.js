/* console-engine.js — deterministic world + pure game logic for /console/ (K235).
   A seed string -> an identical room graph, every run (mulberry32/xmur3 via
   console-prng.js). No DOM, no audio, no direct localStorage: the page shell
   (console.js) renders + wires I/O; this module is pure and testable.
   FICTION ONLY. Zero argument-library import, zero philosophical stance —
   a black-console descent through an ashen structure, nothing more. */
(function (root, factory) {
  "use strict";
  var PRNG = (typeof require === "function")
    ? require("./console-prng.js")
    : (typeof window !== "undefined" ? window.ConsolePRNG : null);
  var api = factory(PRNG);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ConsoleEngine = api;
})(typeof self !== "undefined" ? self : this, function (PRNG) {
  "use strict";

  var SAVE_KEY = "wuld:console:save";        // own-key namespace: wuld:console:*
  var DIRS = ["n", "s", "e", "w"];
  var DVEC = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  var OPP = { n: "s", s: "n", e: "w", w: "e" };
  var DNAME = { n: "north", s: "south", e: "east", w: "west" };

  // -------- word banks (dark, decaying; deliberately content-empty of any thesis)
  var ADJ = ["ashen", "flooded", "collapsing", "silent", "fluorescent", "derelict",
    "frost-bitten", "smoke-stained", "waterlogged", "forgotten", "humming",
    "windowless", "sagging", "overgrown", "cratered", "sunless", "peeling", "cold"];
  var NOUN = ["corridor", "vault", "stairwell", "antechamber", "gallery", "boiler room",
    "ward", "archive", "cistern", "concourse", "dormitory", "furnace", "atrium",
    "substation", "reading room", "waiting room", "pump house", "sorting hall"];
  var AIR = ["thick with rust and standing water",
    "still, and colder than the last",
    "faintly sweet, like something left too long",
    "dry enough to crack the lips",
    "moving, though there is no window",
    "heavy with the smell of wet chalk",
    "so quiet you can hear your own pulse",
    "grey with a dust that never settles"];
  var SIGHTS = [
    { s: "a chair bolted to the floor", d: "The bolts are new. Everything else is not." },
    { s: "a clock with no hands", d: "The glass is warm. You are certain it has moved since you looked away." },
    { s: "a wall of water-swollen ledgers", d: "The ink has run into long grey rivers. None of it is legible, and you are glad." },
    { s: "a single bulb swinging on its cord", d: "Nothing is moving the air. It swings anyway, slow and patient." },
    { s: "a mural gone to mould", d: "Under the mould, figures with their backs turned. You do not look for long." },
    { s: "a row of empty coats on hooks", d: "They still hold the shape of shoulders. The wearers are elsewhere." },
    { s: "a floor drain breathing cold air", d: "Down, and down, and then a sound like a door far below." },
    { s: "a mirror turned to face the wall", d: "You leave it that way. Some kindnesses are for yourself." },
    { s: "a stopped elevator, doors ajar", d: "The car is not there. The shaft is, and it is very deep." },
    { s: "a television showing grey static", d: "For a moment the static resolves into a hallway exactly like this one." }
  ];

  var ITEMS = {
    key:     { name: "a brass key, cold as a coin",   take: "You pocket the brass key. It is colder than the room, and stays cold." },
    candle:  { name: "a stub of candle",              take: "You take the candle stub. No way to light it, but the weight is a comfort." },
    map:     { name: "a folded map, water-ruined",    take: "You take the map. Every corridor on it leads to the same unmarked room." },
    wire:    { name: "a coil of copper wire",         take: "You take the copper wire and loop it over your wrist." },
    lens:    { name: "a lens, cracked across",        take: "You take the cracked lens. Through it the room is no clearer." },
    matches: { name: "a matchbook, three left",       take: "You take the matchbook. Three matches. You will save them." }
  };
  var FLAVOR = ["candle", "map", "wire", "lens", "matches"];

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------------------------------------------------------------- world gen
  function genWorld(seedStr) {
    var rng = PRNG.makeRng(seedStr == null ? "" : String(seedStr));
    var W = 5, H = 5;
    var target = rng.range(11, 15);

    var grid = [];
    for (var gy = 0; gy < H; gy++) { grid.push([]); for (var gx = 0; gx < W; gx++) grid[gy].push(-1); }
    function idAt(x, y) { return (x < 0 || y < 0 || x >= W || y >= H) ? -1 : grid[y][x]; }

    var cells = [];                      // index -> {x,y}
    var sx = rng.int(W), sy = rng.int(H);
    grid[sy][sx] = 0; cells.push({ x: sx, y: sy });
    var treeEdges = [];                  // [fromId, dir, toId] — a spanning tree = guaranteed connectivity
    var cur = 0, guard = 0;
    function hasEmptyNb(id) {
      var c = cells[id];
      for (var q = 0; q < DIRS.length; q++) { var vv = DVEC[DIRS[q]]; if (idAt(c.x + vv[0], c.y + vv[1]) === -1) return true; }
      return false;
    }
    while (cells.length < target && guard++ < 6000) {
      var cc = cells[cur], cx = cc.x, cy = cc.y;
      var order = rng.shuffle(DIRS.slice());
      var stepped = false;
      for (var oi = 0; oi < order.length; oi++) {
        var d = order[oi], v = DVEC[d], nx = cx + v[0], ny = cy + v[1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        if (grid[ny][nx] === -1) {
          var newId = cells.length; grid[ny][nx] = newId; cells.push({ x: nx, y: ny });
          treeEdges.push([cur, d, newId]);       // carve the tree edge as we place -> connected
          cur = newId; stepped = true; break;
        }
      }
      if (!stepped) {                             // resume from a placed cell that can still grow
        var frontier = [];
        for (var fi2 = 0; fi2 < cells.length; fi2++) if (hasEmptyNb(fi2)) frontier.push(fi2);
        if (!frontier.length) break;
        cur = frontier[rng.int(frontier.length)];
      }
    }

    // rooms
    var rooms = [];
    for (var i = 0; i < cells.length; i++) {
      rooms.push({ id: i, x: cells[i].x, y: cells[i].y,
        title: "", desc: "", sight: "", sightDetail: "", item: null, tone: 0,
        exits: { n: null, s: null, e: null, w: null } });
    }
    // spanning-tree doors (connectivity)
    for (var te = 0; te < treeEdges.length; te++) {
      var ea = treeEdges[te][0], edr = treeEdges[te][1], eb = treeEdges[te][2];
      rooms[ea].exits[edr] = eb; rooms[eb].exits[OPP[edr]] = ea;
    }
    // extra loop doors (deterministic E/S scan; only where not already a door)
    for (var r = 0; r < rooms.length; r++) {
      var rx = rooms[r].x, ry = rooms[r].y;
      var eId = idAt(rx + 1, ry), sId = idAt(rx, ry + 1);
      if (eId !== -1 && rooms[r].exits.e == null && rng.chance(0.32)) { rooms[r].exits.e = eId; rooms[eId].exits.w = r; }
      if (sId !== -1 && rooms[r].exits.s == null && rng.chance(0.32)) { rooms[r].exits.s = sId; rooms[sId].exits.n = r; }
    }

    // prose (fixed room-index order)
    for (var p = 0; p < rooms.length; p++) {
      var rp = rooms[p];
      rp.title = cap(rng.pick(ADJ)) + " " + rng.pick(NOUN);
      var air = rng.pick(AIR);
      var sg = rng.pick(SIGHTS);
      rp.sight = sg.s; rp.sightDetail = sg.d;
      rp.tone = rng.int(6);
      rp.desc = "The air is " + air + ". Against the far wall, " + sg.s + ".";
    }

    // entrance + terminus (BFS farthest from start; tie-break lowest id)
    var startId = 0;
    var dist = bfs(rooms, startId);
    var terminusId = startId, best = -1;
    for (var t = 0; t < rooms.length; t++) {
      if (dist[t] > best) { best = dist[t]; terminusId = t; }
    }

    // the key room: a placed room that is neither start nor terminus (deterministic pool)
    var pool = [];
    for (var k = 0; k < rooms.length; k++) if (k !== startId && k !== terminusId) pool.push(k);
    var keyRoomId = pool.length ? pool[rng.int(pool.length)] : startId;
    rooms[keyRoomId].item = "key";

    // a few flavour items in other rooms
    var flav = rng.shuffle(FLAVOR.slice());
    var fi = 0;
    for (var fr = 0; fr < rooms.length && fi < 3; fr++) {
      if (fr === startId || fr === terminusId || rooms[fr].item) continue;
      if (rng.chance(0.5)) { rooms[fr].item = flav[fi % flav.length]; fi++; }
    }

    rooms[startId].title = "Threshold";
    rooms[startId].desc = "You are at the threshold. The way back is a door that no longer opens — you have tried it, and it is only a wall now. Ahead, the structure goes down.";
    rooms[terminusId].title = "The Descent";

    return { seed: rng.seed, w: W, h: H, rooms: rooms,
      startId: startId, terminusId: terminusId, keyItemId: "key", keyRoomId: keyRoomId };
  }

  function bfs(rooms, from) {
    var d = []; for (var i = 0; i < rooms.length; i++) d.push(-1);
    d[from] = 0; var q = [from];
    while (q.length) {
      var cur = q.shift();
      for (var di = 0; di < DIRS.length; di++) {
        var nid = rooms[cur].exits[DIRS[di]];
        if (nid != null && d[nid] === -1) { d[nid] = d[cur] + 1; q.push(nid); }
      }
    }
    return d;
  }

  // ---------------------------------------------------------------- state
  function newState(world) {
    return { seed: world.seed, pos: world.startId, visited: [world.startId],
      inv: [], turns: 0, done: false };
  }
  function hasItem(state, id) { return state.inv.indexOf(id) >= 0; }
  function hasKey(world, state) { return hasItem(state, world.keyItemId); }
  function markVisited(state, id) { if (state.visited.indexOf(id) < 0) state.visited.push(id); }

  // ---------------------------------------------------------------- describe
  function exitList(room) {
    var out = [];
    for (var i = 0; i < DIRS.length; i++) if (room.exits[DIRS[i]] != null) out.push(DNAME[DIRS[i]]);
    return out;
  }
  function describe(world, state, id) {
    var room = world.rooms[id];
    var lines = [];
    lines.push("== " + room.title + " ==");
    lines.push(room.desc);
    if (room.item && state.inv.indexOf(room.item) < 0) {
      lines.push("On the floor: " + ITEMS[room.item].name + ".");
    }
    var ex = exitList(room);
    lines.push("Exits: " + (ex.length ? ex.join(", ") : "none that you can find") + ".");
    return lines.join("\n");
  }

  // ---------------------------------------------------------------- verbs
  function move(world, state, dir) {
    dir = normDir(dir);
    if (!dir) return { state: state, msg: "Go where? (north, south, east, west)", event: "error" };
    var room = world.rooms[state.pos];
    var dest = room.exits[dir];
    if (dest == null) return { state: state, msg: "No way " + DNAME[dir] + ". The wall gives nothing.", event: "blocked" };
    if (dest === world.terminusId && !hasKey(world, state)) {
      return { state: state, msg: "The way down is sealed — a warded door, and no give in it. Something is missing. (Find the brass key.)", event: "blocked" };
    }
    var ns = clone(state);
    ns.pos = dest; ns.turns = state.turns + 1; markVisited(ns, dest);
    if (dest === world.terminusId) {
      ns.done = true;
      return { state: ns, msg: winText(world, ns), event: "win" };
    }
    return { state: ns, msg: describe(world, ns, dest), event: "move" };
  }
  function look(world, state) { return { state: state, msg: describe(world, state, state.pos), event: "look" }; }
  function examine(world, state, target) {
    var room = world.rooms[state.pos];
    target = (target || "").toLowerCase().trim();
    if (!target || target === "room" || target === "here") {
      return { state: state, msg: room.sight ? (cap(room.sight) + ". " + room.sightDetail) : "Nothing here rewards a closer look.", event: "examine" };
    }
    if (target === "me" || target === "self" || target === "myself") {
      return { state: state, msg: "You are still here. You have been walking a long time. Your hands are steady, which surprises you.", event: "examine" };
    }
    // item present or held?
    var idHit = matchItem(target);
    if (idHit && (room.item === idHit || hasItem(state, idHit))) {
      return { state: state, msg: cap(ITEMS[idHit].name) + ". " + (idHit === "key" ? "It fits nothing you have found. Yet." : "It tells you nothing you did not already fear."), event: "examine" };
    }
    // the room's sight by keyword
    if (room.sight && room.sight.toLowerCase().indexOf(target) >= 0) {
      return { state: state, msg: cap(room.sight) + ". " + room.sightDetail, event: "examine" };
    }
    return { state: state, msg: "There is no " + target + " here — or if there is, it does not wish to be seen.", event: "error" };
  }
  function take(world, state) {
    var room = world.rooms[state.pos];
    if (!room.item || hasItem(state, room.item)) {
      return { state: state, msg: "Nothing here to take.", event: "error" };
    }
    var ns = clone(state);
    ns.inv = state.inv.slice(); ns.inv.push(room.item);
    return { state: ns, msg: ITEMS[room.item].take, event: "take" };
  }
  function inventory(world, state) {
    if (!state.inv.length) return { state: state, msg: "You are carrying nothing.", event: "look" };
    var names = state.inv.map(function (id) { return "  " + ITEMS[id].name; });
    return { state: state, msg: "You are carrying:\n" + names.join("\n"), event: "look" };
  }

  function winText(world, state) {
    return [
      "== The Descent ==",
      "The warded door opens on nothing you can name — stairs, and past the stairs, the cold that was under every room in this place.",
      "You go down. You were always going to go down.",
      "",
      "— you reached the descent in " + state.turns + " moves —",
      "Type  new  for another structure, or  new <word>  to name the seed."
    ].join("\n");
  }

  // ---------------------------------------------------------------- map
  function renderMap(world, state) {
    // crude grid map of VISITED rooms; @ = you, + = visited, . = unknown, X = descent (if seen)
    var g = [];
    for (var y = 0; y < world.h; y++) { var row = []; for (var x = 0; x < world.w; x++) row.push("  "); g.push(row); }
    for (var i = 0; i < world.rooms.length; i++) {
      var rm = world.rooms[i];
      if (state.visited.indexOf(i) < 0) continue;
      var ch = "+ ";
      if (i === state.pos) ch = "@ ";
      else if (i === world.terminusId) ch = "X ";
      else if (i === world.startId) ch = "o ";
      g[rm.y][rm.x] = ch;
    }
    var out = ["  (map — only what you have walked)"];
    for (var yy = 0; yy < world.h; yy++) out.push("   " + g[yy].join(""));
    out.push("  @ you   o threshold   X descent   + walked");
    return out.join("\n");
  }

  // ---------------------------------------------------------------- persistence (own-key only)
  function save(state, storage) {
    try {
      storage.setItem(SAVE_KEY, JSON.stringify({
        seed: state.seed, pos: state.pos, visited: state.visited,
        inv: state.inv, turns: state.turns, done: state.done
      }));
      return true;
    } catch (e) { return false; }
  }
  function load(storage) {
    try {
      var raw = storage.getItem(SAVE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o.seed !== "string") return null;
      return { seed: o.seed, pos: o.pos | 0, visited: o.visited || [o.pos | 0],
        inv: o.inv || [], turns: o.turns | 0, done: !!o.done };
    } catch (e) { return null; }
  }
  function clearSave(storage) { try { storage.removeItem(SAVE_KEY); return true; } catch (e) { return false; } }

  // ---------------------------------------------------------------- helpers
  function clone(s) { return { seed: s.seed, pos: s.pos, visited: s.visited.slice(), inv: s.inv.slice(), turns: s.turns, done: s.done }; }
  function normDir(d) {
    d = (d || "").toLowerCase();
    if (d === "n" || d === "north") return "n";
    if (d === "s" || d === "south") return "s";
    if (d === "e" || d === "east") return "e";
    if (d === "w" || d === "west") return "w";
    return null;
  }
  function matchItem(t) {
    if (/key|brass/.test(t)) return "key";
    if (/candle/.test(t)) return "candle";
    if (/map/.test(t)) return "map";
    if (/wire|copper/.test(t)) return "wire";
    if (/lens/.test(t)) return "lens";
    if (/match/.test(t)) return "matches";
    return null;
  }
  function itemName(id) { return ITEMS[id] ? ITEMS[id].name : id; }

  return {
    SAVE_KEY: SAVE_KEY,
    genWorld: genWorld, newState: newState, describe: describe,
    move: move, look: look, examine: examine, take: take, inventory: inventory,
    renderMap: renderMap, hasKey: hasKey, hasItem: hasItem, itemName: itemName,
    save: save, load: load, clearSave: clearSave,
    ITEMS: ITEMS, DNAME: DNAME
  };
});
