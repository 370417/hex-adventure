(function (Heap,Alea) {
'use strict';

Heap = 'default' in Heap ? Heap['default'] : Heap;
Alea = 'default' in Alea ? Alea['default'] : Alea;

function createEntity(entities) {
    const entity = { id: entities.nextId };
    entities[entity.id] = entity;
    entities.nextId++;
    return entity;
}

// Constants for map tiles
var Tile;
(function (Tile) {
    Tile[Tile["null"] = 0] = "null";
    Tile[Tile["wall"] = 1] = "wall";
    Tile[Tile["floor"] = 2] = "floor";
})(Tile || (Tile = {}));
// const Tiles = {}
// for (let i = 0; i < vals.length; i++) {
//     const properties = vals[i]
//     const name = properties[0]
//     const tile = {}
//     for (let j = 0; j < keys.length; j++) {
//         tile[keys[j]] = properties[j]
//     }
//     this[name] = name
//     Tiles[name] = tile
// }

// Helper functions for working with positions
const WIDTH$1 = 48;
const dir1 = 1 - WIDTH$1;
const dir3 = 1;
const dir5 = WIDTH$1;
const dir7 = -1 + WIDTH$1;
const dir9 = -1;
const dir11 = -WIDTH$1;
const directions = [dir1, dir3, dir5, dir7, dir9, dir11];
function xy2pos(x, y) {
    return x + y * WIDTH$1;
}
function pos2xy(pos) {
    return {
        x: pos % WIDTH$1,
        y: Math.floor(pos / WIDTH$1),
    };
}
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
function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}
function floodfillSet(pos, passable, visited) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited);
        });
    }
}
function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false;
        }
    }
    return true;
}
function forEachNeighbor(pos, callback) {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i]);
    }
}

// Helper functions for working with randomness
function randint(min, max, random) {
    return min + Math.floor((max - min + 1) * random());
}
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random);
        const tempi = array[i];
        array[i] = array[j];
        array[j] = tempi;
    }
    return array;
}

const WIDTH = 48;
const HEIGHT = 31;
function createLevel(seed, player) {
    const random = Alea(seed);
    const types = createTypes();
    const weights = createRandomWeights();
    const actors = createActors();
    //makeLakes()
    carveCaves();
    removeSmallWalls();
    const size = removeOtherCaves();
    if (size < WIDTH * HEIGHT / 4) {
        return createLevel(random(), player);
    }
    fillSmallCaves();
    function createRandomWeights() {
        const weights = {};
        forEachInnerPos(pos => {
            weights[pos] = random();
        });
        return weights;
    }
    function createTypes() {
        const types = {};
        forEachPos(pos => {
            types[pos] = Tile.wall;
        });
        types[player.pos] = Tile.floor;
        return types;
    }
    function createActors() {
        const actors = {};
        actors[player.pos] = player;
        return actors;
    }
    function isFloor(pos) {
        return types[pos] === Tile.floor;
    }
    function passable(pos) {
        return types[pos] === Tile.floor; // || types[pos] === Tiles.SHALLOW_WATER
    }
    function isWall(pos) {
        return inBounds(pos) && types[pos] === Tile.wall;
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
    //         const type = val < 0.6 ? Tiles.DEEP_WATER : Tiles.SHALLOW_WATER
    //         types.set(pos, type)
    //     }
    //     return lake
    // }
    // function makeLakes() {
    //     makeLake()
    // }
    function carveCaves() {
        const innerPositions = [];
        forEachInnerPos(pos => innerPositions.push(pos));
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = Tile.floor;
            }
        });
    }
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
                    types[pos] = Tile.floor;
                }
            }
        });
    }
    function removeOtherCaves() {
        const mainCave = new Set();
        floodfillSet(player.pos, passable, mainCave);
        forEachInnerPos(pos => {
            if (types[pos] === Tile.floor && !mainCave.has(pos)) {
                types[pos] = Tile.wall;
            }
        });
        return mainCave.size;
    }
    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, passable) === 1;
    }
    function isNotCave(pos) {
        return isWall(pos) || countGroups(pos, passable) !== 1;
    }
    function isDeadEnd(pos) {
        return isFloor(pos)
            && countGroups(pos, passable) === 1
            && surrounded(pos, isNotCave);
    }
    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            types[pos] = Tile.wall;
            forEachNeighbor(pos, neighbor => {
                if (pos === player.pos && passable(neighbor)) {
                    player.pos = neighbor;
                }
                fillDeadEnd(neighbor);
            });
        }
    }
    function fillSmallCaves() {
        // can't skip visited tiles here because previous caves can be affected
        // by the removal of later ones
        forEachInnerPos(pos => {
            fillDeadEnd(pos);
            const cave = new Set();
            floodfillSet(pos, isCave, cave);
            if (cave.size === 2 || cave.size === 3) {
                types[pos] = Tile.wall;
                for (const pos of cave) {
                    fillDeadEnd(pos);
                }
            }
        });
    }
    return {
        types,
        actors,
    };
}
function xmin(y) {
    return Math.floor((HEIGHT - y) / 2);
}
function xmax(y) {
    return WIDTH - Math.floor(y / 2);
}
function inBounds(pos) {
    const { x, y } = pos2xy(pos);
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y);
}
function forEachPos(fun) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y);
        const max = xmax(y);
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}
function forEachInnerPos(fun) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1;
        const max = xmax(y) - 1;
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}

const version = '0.1.0';
const SAVE_NAME = 'hex adventure';
// load save game if it exists, otherwise create a new game
function getGame() {
    let game = load() || create(Date.now());
    if (game.version !== version) {
        console.warn('Save game is out of date');
    }
    console.log('Seed:', game.seed);
    return game;
}
function create(seed) {
    const schedule = [];
    const entities = { nextId: 1 };
    const player = createEntity(entities);
    player.pos = 234;
    player.type = 'player';
    schedule.unshift(player.id);
    const level = createLevel(seed, player);
    return { version, seed, schedule, entities, player, level };
}
function save(game) {
    localStorage[SAVE_NAME] = JSON.stringify(game);
}
function load() {
    const saveFile = localStorage[SAVE_NAME];
    return saveFile && JSON.parse(saveFile);
}

const Behavior = {
    player(game) {
        return Infinity;
    },
};
// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }
function step(game) {
    const id = game.schedule[0];
    const entity = game.entities[id];
    return Behavior[entity.type](game);
}

const xu = 18;
const smallyu = 16;
const bigyu = 24;
const root = document.getElementById('game');
const tiles = createTiles();
const game = getGame();
function loop() {
    let delay = 0;
    while (!delay) {
        delay = step(game);
    }
    render(game);
    if (delay === Infinity) {
        save(game);
    }
    else {
        defer(loop, delay);
    }
}
function defer(fun, frames) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1));
    }
    fun();
}
function render(game) {
    forEachPos(pos => {
        const type = game.level.types[pos];
        const tile = tiles[pos];
        tile.dataset.type = Tile[type];
    });
}
function positionTile(tile, x, y) {
    const realx = (x - (HEIGHT - y - 1) / 2) * xu;
    const realy = (y - 1) * smallyu + bigyu;
    tile.style.left = realx + 'px';
    tile.style.top = realy + 'px';
}
function createTiles() {
    const tiles = {};
    const $tiles = document.createElement('div');
    $tiles.id = 'tiles';
    forEachPos((pos, x, y) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.type = 'null';
        positionTile(tile, x, y);
        $tiles.appendChild(tile);
        tiles[pos] = tile;
    });
    root.appendChild($tiles);
    return tiles;
}

loop();

}(Heap,Alea));
