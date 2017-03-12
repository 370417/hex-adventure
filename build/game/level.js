import { Tile } from './tile';
import { floodfill, floodfillSet, countGroups, surrounded, forEachNeighbor, xy2pos, pos2xy } from './position';
import { shuffle } from './random';
import { alea } from '../lib/alea';
export const WIDTH = 48;
export const HEIGHT = 31;
export function createLevel(seed, player) {
    const random = alea(seed);
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
    return Math.floor((this.HEIGHT - y) / 2);
}
function xmax(y) {
    return WIDTH - Math.floor(y / 2);
}
function inBounds(pos) {
    const { x, y } = pos2xy(pos);
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y);
}
function inInnerBounds(pos) {
    const { x, y } = pos2xy(pos);
    return y > 0 && y < HEIGHT - 1 && x > xmin(y) && x < xmax(y) - 1;
}
export function forEachPos(fun) {
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
