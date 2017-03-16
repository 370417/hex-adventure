(function () {
'use strict';

function createEntity(entities) {
    const entity = {id: entities.nextId};
    entities[entity.id] = entity;
    entities.nextId++;
    return entity
}

/// helper functions for working with positions

// import Heap from 'heap'

const WIDTH$1 = 48;
const dir1 = 1 - WIDTH$1;
const dir3 = 1;
const dir5 = WIDTH$1;
const dir7 = -1 + WIDTH$1;
const dir9 = -1;
const dir11 = -WIDTH$1;

const directions = [dir1, dir3, dir5, dir7, dir9, dir11];

/// convert the coordinate pair [x], [y] into an integer position
function xy2pos(x, y) {
    return x + y * WIDTH$1
}

/// convert an integer [pos] into the coordinate pair x, y
function pos2xy(pos) {
    return {
        x: pos % WIDTH$1,
        y: Math.floor(pos / WIDTH$1),
    }
}

/// return the number of contiguous groups of tiles around a [pos] that satisfy [ingroup]
function countGroups(pos, ingroup) {
    // use var instead of let because
    // chrome can't optimize compound let assignment
    var groupcount = 0;
    for (let i = 0; i < 6; i++) {
        const curr = directions[i];
        const next = directions[(i+1)%6];
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1;
        }
    }
    if (groupcount) {
        return groupcount
    } else {
        return Number(ingroup(pos + dir1))
    }
}

/// [flood] from [pos] as long as neighbors are [floodable]
/// it is up to [flood] to make sure that [floodable] returns false for visited positions
function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}

/// flood from [pos] as long as neighbors are [passable]
/// [visited] keeps track of what positions have already been flooded, and is normally set to empty
function floodfillSet(pos, passable, visited) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited);
        });
    }
}

/// whether [istype] is true for all positions surrounding [pos]
function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false
        }
    }
    return true
}

/// calls [callback] for each position neighboring [pos]
function forEachNeighbor(pos, callback) {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i]);
    }
}

/// A* with limited range and no heuristic
/// returns a map of visited positions to net cost
// export function flowmap(
//     startpos: number,
//     range: number,
//     forEachNeighbor: (pos: number, callback: (pos: number) => void) => void,
//     cost: (pos: number) => number
// ): Map<number, number> {
//     const open = new Map<number, number>() // map of positions to net cost
//     open.set(startpos, 0)
//     const closed = new Map<number, number>()
//     const openHeap = new Heap<number>((a, b) => open.get(a) - open.get(b))
//     openHeap.push(startpos)

//     while (!openHeap.empty()) {
//         const pos = openHeap.pop()
//         const netCost = <number> open.get(pos)
//         if (netCost > range) {
//             return closed
//         }
//         open.delete(pos)
//         closed.set(pos, netCost)

//         forEachNeighbor(pos, neighbor => {
//             if (!closed.has(neighbor)) {
//                 const altCost = netCost + cost(neighbor)
//                 if (!open.has(neighbor)) {
//                     open.set(neighbor, altCost)
//                     openHeap.push(neighbor)
//                 }
//                 else if (altCost < open.get(neighbor)) {
//                     open.set(neighbor, altCost)
//                     openHeap.update(neighbor)
//                 }
//             }
//         })
//     }
//     return closed
// }

/// helper functions for working with randomness

/// return a random integer in the range [min], [max] inclusive
function randint(min, max, random) {
    return min + Math.floor((max - min + 1) * random())
}

/// randomly shuffle an [array] in place
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random);
        const tempi = array[i];
        array[i] = array[j];
        array[j] = tempi;
    }
    return array
}

/// handles level generation and iteration

const WIDTH = 48;
const HEIGHT = 31;

/// create a new level
function createLevel(seed, player) {
    const random = Alea(seed);
    const types = createTypes();
    const weights = createRandomWeights();

    //makeLakes()
    carveCaves();
    removeSmallWalls();
    const size = removeOtherCaves();
    console.log(size);
    if (size < WIDTH * HEIGHT / 4) {
        return createLevel(random(), player)
    }
    fillSmallCaves();

    const actors = createActors();

    /// return a dict of positions to a random number
    function createRandomWeights() {
        const weights = {};
        forEachInnerPos(pos => {
            weights[pos] = random();
        });
        return weights
    }

    /// return a dict of positions to tile types
    /// all tiles are initially walls except for the player's position, which is a floor
    function createTypes() {
        const types = {};
        forEachPos(pos => {
            types[pos] = 'wall';
        });
        types[player.pos] = 'floor';
        return types
    }

    /// return a dict of positions to actor ids
    function createActors() {
        const actors = {};
        actors[player.pos] = player.id;
        return actors
    }

    /// whether the tile at [pos] is a floor tile
    function isFloor(pos) {
        return types[pos] === 'floor'
    }

    /// whether the tile at [pos] is passable
    function passable(pos) {
        return types[pos] === 'floor'// || types[pos] === '.'SHALLOW_WATER
    }

    /// whether the tile at [pos] is a wall tile
    function isWall(pos) {
        return inBounds(pos) && types[pos] === 'wall'
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

    /// use an (almost) cellular automaton to generate caves
    function carveCaves() {
        const innerPositions = [];
        forEachInnerPos(pos => innerPositions.push(pos));
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = 'floor';
            }
        });
    }

    /// remove groups of 5 or fewer walls
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

    /// remove disconnected caves
    function removeOtherCaves() {
        const mainCave = new Set();
        floodfillSet(player.pos, passable, mainCave);

        forEachInnerPos(pos => {
            if (types[pos] === 'floor' && !mainCave.has(pos)) {
                types[pos] = 'wall';
            }
        });

        return mainCave.size
    }

    /// whether the tile at [pos] is part of a cave
    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, passable) === 1
    }

    /// whether the tile at [pos] is not part of a cave
    function isNotCave(pos) {
        return isWall(pos) || countGroups(pos, passable) !== 1
    }

    /// whether the tile at [pos] is a dead end
    function isDeadEnd(pos) {
        return isFloor(pos)
        && countGroups(pos, passable) === 1
        && surrounded(pos, isNotCave)
    }

    /// recursively fill a dead end
    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            types[pos] = 'wall';
            forEachNeighbor(pos, neighbor => {
                if (pos === player.pos && passable(neighbor)) {
                    player.pos = neighbor;
                }
                fillDeadEnd(neighbor);
            });
        }
    }

    /// remove 2-3 tile caves that are connected to the main cave
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

    return {
        types,
        actors,
    }
}

/// return the minimum x coordinate for a given [y], inclusive
function xmin(y) {
    return Math.floor((HEIGHT - y) / 2)
}

/// return the maximum x coordinate for a given [y], exclusive
function xmax(y) {
    return WIDTH - Math.floor(y / 2)
}

/// whether [pos] is inside the level
function inBounds(pos) {
    const {x, y} = pos2xy(pos);
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y)
}

/// call [fun] for each position in the level
function forEachPos(fun) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y);
        const max = xmax(y);
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}

/// call [fun] for each position in the level except the outer edge
function forEachInnerPos(fun) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1;
        const max = xmax(y) - 1;
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}

/// handles game creation, saving, and loading

const VERSION = '0.1.0';
const SAVE_NAME = 'hex adventure';

/// load save game if it exists, otherwise create a new game
function getGame() {
    let game = load() || create(Date.now());
    if (game.version !== VERSION) {
        console.warn('Save game is out of date');
    }
    console.log('Seed:', game.seed);
    window.game = game;
    return game
}

function create(seed) {
    const version = VERSION;
    const schedule = [];
    const entities = {nextId: 1};
    const player = createEntity(entities);
    player.fov = {};
    player.pos = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2));
    player.type = 'player';
    schedule.unshift(player.id);
    const level = createLevel(seed, player);

    return {version, seed, schedule, entities, player, level}
}

function save(game) {
    localStorage[SAVE_NAME] = JSON.stringify(game);
}

function load() {
    const saveFile = localStorage[SAVE_NAME];
    return saveFile && JSON.parse(saveFile)
}

function fov(center, transparent, reveal) {
    reveal(center);
    const normals = [dir1, dir3, dir5, dir7, dir9, dir11];
    const tangents = [dir5, dir7, dir9, dir11, dir1, dir3];
    for (let i = 0; i < 6; i++) {
        const transform = (x, y) => center + x * normals[i] + y * tangents[i];
        const transformedTransparent = (x, y) => transparent(transform(x, y));
        const transformedReveal = (x, y) => reveal(transform(x, y));
        transformedReveal(0, 1);
        scan(1, 0, 1, transformedTransparent, transformedReveal);
    }
}

/// round a number, rounding up if it ends in .5
function roundHigh(n) {
    return Math.round(n)
}

/// round a number, rounding down if it ends in .5
function roundLow(n) {
    return Math.ceil(n - 0.5)
}

function scan(y, start, end, transparent, reveal) {
    if (start >= end) return
    const xmin = roundHigh((y - 0.5) * start);
    const xmax = roundLow((y + 0.5) * end);
    let revealCalled = false;
    for (let x = xmin; x <= xmax; x++) {
        if (transparent(x, y)) {
            if (x >= y * start && x <= y * end) {
                reveal(x, y);
                revealCalled = true;
                if (!transparent(x, y + 1)) reveal(x, y + 1);
                if (!transparent(x + 1, y + 1)) reveal(x + 1, y + 1);
            }
        } else {
            if (revealCalled) {
                scan(y + 1, start, (x - 0.5) / y, transparent, reveal);
            }
            start = (x + 0.5) / y;
            if (start >= end) return
        }
    }
    if (revealCalled) {
        scan(y + 1, start, end, transparent, reveal);
    }
}

/// handles actor behavior and scheduling (turn order)

/// dict of actor behaviors
const Behavior = {
    player(self, game) {
        function transparent(pos) {
            return game.level.types[pos] === 'floor'
        }
        function reveal(pos) {
            self.fov[pos] = true;
        }
        fov(self.pos, transparent, reveal);
        return Infinity
    },
};

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

/// advance [game]state by an atomic step
function step(game) {
    const id = game.schedule[0];
    const entity = game.entities[id];
    return Behavior[entity.type](entity, game)
}

/// handles displaying the game and the game loop

const xu = 18;
const smallyu = 16;
const bigyu = 24;
const root = document.getElementById('game');
const tiles = createTiles();
const game = getGame();

/// advance the gamestate until player input is needed
function loop() {
    let delay = 0;
    while (!delay) {
        delay = step(game);
    }
    render(game);
    if (delay === Infinity) {
        save(game);
    } else {
        defer(loop, delay);
    }
}

/// call [fun] after waiting for [frames]
function defer(fun, frames) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1));
    }
    fun();
}

/// render the [game]
function render(game) {
    forEachPos(pos => {
        const $tile = tiles[pos];
        const actorId = game.level.actors[pos];
        if (game.player.fov[pos]) {
            if (actorId) {
                $tile.dataset.type = game.entities[actorId].type;
            } else {
                $tile.dataset.type = game.level.types[pos];
            }
        } else {
            $tile.dataset.type = game.level.types[pos];
            $tile.style.opacity = '0.5';
        }
    });
}

/// put the [tile] element in the position [x], [y]
function positionTile(tile, x, y) {
    const realx = (x - (HEIGHT - y - 1) / 2) * xu;
    const realy = (y - 1) * smallyu + bigyu;
    tile.style.left = realx + 'px';
    tile.style.top = realy + 'px';
}

/// create tile elements and return a dict of them by position
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
    return tiles
}

/// entry point

loop();

}());
