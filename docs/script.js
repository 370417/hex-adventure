(function (React,ReactDOM) {
'use strict';

const WIDTH = 48;
const HEIGHT = 31;
const dir1 = 1 - WIDTH;
const dir3 = 1;
const dir5 = WIDTH;
const dir7 = -1 + WIDTH;
const dir9 = -1;
const dir11 = -WIDTH;
const directions = [dir1, dir3, dir5, dir7, dir9, dir11];

/** @file helper functions for working with positions */
/** convert the coordinate pair [x], [y] into an integer position */
function xy2pos(x, y) {
    return x + y * WIDTH;
}
/** convert an integer [pos] into the coordinate pair x, y */
function pos2xy(pos) {
    return {
        x: pos % WIDTH,
        y: Math.floor(pos / WIDTH),
    };
}
/** return the number of contiguous groups of tiles around a [pos] that satisfy [ingroup] */
function countGroups(pos, ingroup) {
    // use var instead of let because
    // chrome can't optimize compound let assignment
    var groupcount = 0;
    for (let i = 0; i < 6; i++) {
        const curr = directions[i];
        const next = directions[(i + 1) % 6];
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1;
        }
    }
    if (groupcount) {
        return groupcount;
    }
    else {
        return Number(ingroup(pos + dir1));
    }
}
/**
 * [flood] from [pos] as long as neighbors are [floodable]
 * it is up to [flood] to make sure that [floodable] returns false for visited positions
 */
function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}
/**
 * flood from [pos] as long as neighbors are [passable]
 * [visited] keeps track of what positions have already been flooded, and is normally set to empty
 */
function floodfillSet(pos, passable, visited) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited);
        });
    }
}
/** whether [istype] is true for all positions surrounding [pos] */
function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false;
        }
    }
    return true;
}
/** calls [callback] for each position neighboring [pos] */
function forEachNeighbor(pos, callback) {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i]);
    }
}

/** @file helper functions for working with randomness */
/** return a random integer in the range [min, max] inclusive */
function randint(min, max, random) {
    return min + Math.floor((max - min + 1) * random());
}
/** randomly shuffle an array in place */
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random);
        const tempi = array[i];
        array[i] = array[j];
        array[j] = tempi;
    }
    return array;
}

/** @file calculates fov */
const normals = [dir1, dir3, dir5, dir7, dir9, dir11];
const tangents = [dir5, dir7, dir9, dir11, dir1, dir3];
/**
 * calculate fov using recursive shadowcasting
 * @param center orgin of fov
 * @param transparent whether the tile at pos is transpaernt
 * @param reveal add pos to the fov
 */
function shadowcast(center, transparent, reveal) {
    reveal(center);
    for (let i = 0; i < 6; i++) {
        const transform = (x, y) => center + x * tangents[i] + y * normals[i];
        const transformedTransparent = (x, y) => transparent(transform(x, y));
        const transformedReveal = (x, y) => reveal(transform(x, y));
        scan(1, 0, 1, transformedTransparent, transformedReveal);
    }
}
/** round a number, rounding up if it ends in .5 */
function roundHigh(n) {
    return Math.round(n);
}
/** round a number, rounding down if it ends in .5 */
function roundLow(n) {
    return Math.ceil(n - 0.5);
}
/**
 * Calculate a 60 degree sector of fov by recursively scanning rows.
 * @param y Distance from center of fov to the row being scanned
 * @param start Slope of starting angle expressed as x / y
 * @param end Slope of ending angle expressed as x / y
 * @param transparent Whether the tile at (x, y) is transparent
 * @param reveal Add the tile at (x, y) to the fov
 */
function scan(y, start, end, transparent, reveal) {
    if (start >= end)
        return;
    // minimum and maximum x coordinates for opaque tiles
    // the fov for transparent tiles is slightly narrower to presernve symmetry
    const xmin = roundHigh(y * start);
    const xmax = roundLow(y * end);
    // whether the current continous fov has transparent tiles
    // this is used to prevent disjoint fov
    let fovExists = false;
    for (let x = xmin; x <= xmax; x++) {
        if (transparent(x, y)) {
            if (x >= y * start && x <= y * end) {
                reveal(x, y);
                fovExists = true;
            }
        }
        else {
            if (fovExists) {
                scan(y + 1, start, (x - 0.5) / y, transparent, reveal);
            }
            reveal(x, y);
            fovExists = false;
            start = (x + 0.5) / y;
            if (start >= end)
                return;
        }
    }
    if (fovExists) {
        scan(y + 1, start, end, transparent, reveal);
    }
}

// Port of alea.js to typescript
// From http://baagoe.com/en/RandomMusings/javascript/
// Johannes Baagøe <baagoe@baagoe.com>, 2010
// version 0.9
// Port of alea.js to typescript
function Alea(...args) {
    const mash = Mash();
    let s0 = mash(' ');
    let s1 = mash(' ');
    let s2 = mash(' ');
    let c = 1;
    if (args.length === 0) {
        args = [Date.now()];
    }
    for (let i = 0; i < args.length; i++) {
        s0 -= mash(args[i]);
        if (s0 < 0) {
            s0 += 1;
        }
        s1 -= mash(args[i]);
        if (s1 < 0) {
            s1 += 1;
        }
        s2 -= mash(args[i]);
        if (s2 < 0) {
            s2 += 1;
        }
    }
    return function random() {
        let t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
        s0 = s1;
        s1 = s2;
        return s2 = t - (c = t | 0);
    };
}
function Mash() {
    let n = 0xefc8249d;
    return function mash(data) {
        data = data.toString();
        for (let i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
}

/** create a new level */
function create$1(seed, player, components) {
    const { position } = components;
    const random = Alea(seed);
    const types = createTypes();
    // const weights = createRandomWeights() // for lakes
    //makeLakes()
    carveCaves();
    removeSmallWalls();
    const size = removeOtherCaves();
    if (size < WIDTH * HEIGHT / 4) {
        return create$1(random(), player, components);
    }
    fillSmallCaves();
    const visibility = generateVisibility();
    placeGrass();
    const actors = createActors();
    /** return a dict of positions to a random number */
    // function createRandomWeights() {
    //     const weights = {}
    //     forEachInnerPos(pos => {
    //         weights[pos] = random()
    //     })
    //     return weights
    // }
    /**
     * return a dict of positions to tile types
     * all tiles are initially walls except for the player's position, which is a floor
     */
    function createTypes() {
        const types = {};
        forEachPos(pos => {
            types[pos] = 'wall';
        });
        types[position[player]] = 'floor';
        return types;
    }
    /** return a dict of positions to actor ids */
    function createActors() {
        const actors = {};
        actors[position[player]] = player;
        return actors;
    }
    /** whether the tile at [pos] is a floor tile */
    function isFloor(pos) {
        return types[pos] === 'floor';
    }
    /** whether the tile at [pos] is passable */
    function passable(pos) {
        return types[pos] === 'floor'; // || types[pos] === '.'SHALLOW_WATER
    }
    /** whether the tile at [pos] is a wall tile */
    function isWall(pos) {
        return inBounds(pos) && types[pos] === 'wall';
    }
    // function makeLake() {
    //     const center = shuffle(Array.from(innerPositions), random)[0]
    //     const neighbors = (pos, callback) => {
    //         forEachNeighbor(pos, neighbor => {
    //             if (innerPositions.has(neighbor)) {
    //                 callback(neighbor)
    //             }
    //         })
    //     }
    //     const cost = pos => 0.1 + 0.3 * weights.get(pos)
    //     const lake = flowmap(center, 1, neighbors, cost)
    //     for ([pos, val] of lake) {
    //         const type = val < 0.6 ? '.'DEEP_WATER : '.'SHALLOW_WATER
    //         types.set(pos, type)
    //     }
    //     return lake
    // }
    // function makeLakes() {
    //     makeLake()
    // }
    /** use an (almost) cellular automaton to generate caves */
    function carveCaves() {
        const innerPositions = [];
        forEachInnerPos(pos => innerPositions.push(pos));
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = 'floor';
            }
        });
    }
    /** remove groups of 5 or fewer walls */
    function removeSmallWalls() {
        const visited = new Set();
        forEachInnerPos(pos => {
            const wallGroup = new Set();
            const floodable = (pos) => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos);
            const flood = (pos) => {
                visited.add(pos);
                wallGroup.add(pos);
            };
            floodfill(pos, floodable, flood);
            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    types[pos] = 'floor';
                }
            }
        });
    }
    /** remove disconnected caves */
    function removeOtherCaves() {
        const mainCave = new Set();
        floodfillSet(position[player], passable, mainCave);
        forEachInnerPos(pos => {
            if (types[pos] === 'floor' && !mainCave.has(pos)) {
                types[pos] = 'wall';
            }
        });
        return mainCave.size;
    }
    /** whether the tile at [pos] is part of a cave */
    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, passable) === 1;
    }
    /** whether the tile at [pos] is not part of a cave */
    function isNotCave(pos) {
        return isWall(pos) || countGroups(pos, passable) !== 1;
    }
    /** whether the tile at [pos] is a dead end */
    function isDeadEnd(pos) {
        return isFloor(pos)
            && countGroups(pos, passable) === 1
            && surrounded(pos, isNotCave);
    }
    /** recursively fill a dead end */
    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            types[pos] = 'wall';
            forEachNeighbor(pos, neighbor => {
                if (pos === position[player] && passable(neighbor)) {
                    position[player] = neighbor;
                }
                fillDeadEnd(neighbor);
            });
        }
    }
    /** remove 2-3 tile caves that are connected to the main cave */
    function fillSmallCaves() {
        // can't skip visited tiles here because previous caves can be affected
        // by the removal of later ones
        forEachInnerPos(pos => {
            fillDeadEnd(pos);
            const cave = new Set();
            floodfillSet(pos, isCave, cave);
            if (cave.size === 2 || cave.size === 3) {
                types[pos] = 'wall';
                for (const pos of cave) {
                    fillDeadEnd(pos);
                }
            }
        });
    }
    /** Find the number of tiles visible from each tile */
    function generateVisibility() {
        const visibility = {};
        forEachInnerPos(pos => {
            let tiles = new Set();
            const transparent = (pos) => types[pos] === 'floor';
            const reveal = (pos) => tiles.add(pos);
            if (transparent(pos)) {
                shadowcast(pos, transparent, reveal);
            }
            visibility[pos] = tiles.size;
            console.log(tiles.size);
        });
        return visibility;
    }
    function placeGrass() {
        forEachInnerPos(pos => {
            if (visibility[pos] > 80) {
                types[pos] = 'tallGrass';
            }
            else if (visibility[pos] > 60) {
                types[pos] = 'shortGrass';
            }
        });
    }
    return {
        types,
        actors,
    };
}
/** return the minimum x coordinate for a given [y], inclusive */
function xmin(y) {
    return Math.floor((HEIGHT - y) / 2);
}
/** return the maximum x coordinate for a given [y], exclusive */
function xmax(y) {
    return WIDTH - Math.floor(y / 2);
}
/** whether [pos] is inside the level */
function inBounds(pos) {
    const { x, y } = pos2xy(pos);
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y);
}
/** call [fun] for each position in the level */
function forEachPos(fun) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y);
        const max = xmax(y);
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}
/** call [fun] for each position in the level except the outer edge */
function forEachInnerPos(fun) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1;
        const max = xmax(y) - 1;
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}

/** @file constants for map tiles */
const Tiles = {
    wall: {
        transparency: 0,
        canWalk: false,
    },
    floor: {
        transparency: 2,
        canWalk: true,
    },
    shortGrass: {
        transparency: 2,
        canWalk: true,
    },
    tallGrass: {
        transparency: 1,
        canWalk: true,
    },
};

const behaviors = {
    player: (game, self) => {
        const { fov, position } = game.components;
        // initialize fov if uninitiazlied
        if (!fov[position[self]]) {
            look(game, self);
        }
        return Infinity;
    }
};

/** @file handles actor behavior and scheduling (turn order) */
/** advance gamestate by an atomic step */
function step(game) {
    const entity = game.schedule[0];
    const behavior = game.components.behavior[entity];
    return behaviors[behavior](game, entity);
}
/** end current actor's turn and setup its next turn */
function reschedule(game) {
    const entity = game.schedule.shift();
    game.schedule.push(entity);
}
/** end current actor's turn and remove it from the schedule */

/** create a new player */
function create$2(entity, { position, behavior, fov, memory }) {
    position[entity] = xy2pos(Math.round(WIDTH / 2), Math.round(HEIGHT / 2));
    behavior[entity] = 'player';
    fov[entity] = {};
    memory[entity] = {};
}
function move(game, self, direction) {
    const { position } = game.components;
    const { actors, types } = game.level;
    const targetPos = position[self] + direction;
    if (Tiles[types[targetPos]].canWalk) {
        actors[position[self]] = undefined;
        position[self] = targetPos;
        actors[position[self]] = self;
    }
    look(game, self);
    reschedule(game);
}
function look(game, self) {
    const types = game.level.types;
    const { fov, memory, position } = game.components;
    fov[self] = {};
    // function transparent(pos: number) {
    //     return game.level.types[pos] === 'floor'
    // }
    // function reveal(pos: number) {
    //     fov[self][pos] = true
    //     memory[self][pos] = game.level.types[pos]
    // }
    shadowcast(position[self], pos => Tiles[types[pos]].transparency === 2, pos => fov[self][pos] = true);
    shadowcast(position[self], pos => Tiles[types[pos]].transparency > 0, pos => memory[self][pos] = types[pos]);
}

const VERSION = '0.1.1';
const SAVE_NAME = 'hex adventure';
/** load save game if it exists, otherwise create a new game */
function getGame() {
    let game = load() || create$$1(Date.now());
    if (game.version !== VERSION) {
        console.warn('Save game is out of date');
    }
    console.log('Seed:', game.seed);
    return game;
}
/** create a new game */
function create$$1(seed) {
    const version = VERSION;
    const schedule = [];
    const components = {
        position: {},
        behavior: {},
        fov: {},
        memory: {},
    };
    const player = 1;
    create$2(player, components);
    schedule.unshift(player);
    const level = create$1(seed, player, components);
    return { version, seed, schedule, components, player, level };
}
/** save a game */
function save(game) {
    localStorage[SAVE_NAME] = JSON.stringify(game);
}
/** load the saved game if it exists */
function load() {
    const saveFile = localStorage[SAVE_NAME];
    return saveFile && JSON.parse(saveFile);
}
/** delete the current savefile */
// function deleteSave() {
//     localStorage.removeItem(SAVE_NAME)
// }

/** @file constants related to visual style */
/** @file constants related to visual style */ const xu = 18;
const smallyu = 16;

/** renders one map tile */
function Tile({ type, color, x, y, opacity }) {
    const left = (x - (HEIGHT - y - 1) / 2) * xu;
    const top = y * smallyu;
    const style = { left, top, opacity };
    if (color) {
        style.background = color;
    }
    return React.createElement("div", { className: `tile ${type}`, style: style });
}

/** renders all map tiles */
function Grid({ game }) {
    const { types, actors } = game.level;
    // const {fov, memory} = game.player
    const fov = game.components.fov[game.player];
    const memory = game.components.memory[game.player];
    const children = [];
    forEachPos((pos, x, y) => {
        // default values for unknown tiles
        let type = 'empty';
        let opacity = 0;
        if (fov[pos]) {
            // visible tiles
            if (actors[pos]) {
                type = game.components.behavior[actors[pos]];
            }
            else {
                type = types[pos];
            }
            opacity = 1;
        }
        else if (memory[pos]) {
            // remembered tiles
            type = types[pos];
            opacity = 0.5;
        }
        children.push(React.createElement(Tile, { key: pos, type: type, x: x, y: y, opacity: opacity }));
    });
    return React.createElement("div", null, children);
}

/** @file handles input */
const movement = {
    KeyE: dir1,
    KeyD: dir3,
    KeyX: dir5,
    KeyZ: dir7,
    KeyA: dir9,
    KeyW: dir11,
};
function keydown(game, e) {
    const direction = movement[e.code];
    if (direction) {
        move(game, game.player, direction);
        loop();
    }
}

/** @file handles displaying the game and the game loop */
const root = document.getElementById('game');
const game = getGame();
window.addEventListener('keydown', keydown.bind(window, game), false);
/** advance the gamestate until player input is needed */
function loop() {
    let delay = 0;
    while (!delay) {
        delay = step(game);
    }
    ReactDOM.render(React.createElement(Grid, { game: game }), root);
    if (delay === Infinity) {
        save(game);
    }
    else {
        defer(loop, delay);
    }
}
/** call [fun] after waiting for [frames] */
function defer(fun, frames) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1));
    }
    else {
        fun();
    }
}

/** @file entry point */
loop();

}(React,ReactDOM));
