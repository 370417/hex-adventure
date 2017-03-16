import { WIDTH, HEIGHT } from './constants'
import { floodfill, floodfillSet, countGroups, surrounded, forEachNeighbor, xy2pos, pos2xy } from './position'
import { shuffle } from './random'

/** @file handles level generation and iteration */

/** create a new level */
export function create(seed, player) {
    const random = Alea(seed)
    const types = createTypes()
    // const weights = createRandomWeights() // for lakes

    //makeLakes()
    carveCaves()
    removeSmallWalls()
    const size = removeOtherCaves()
    if (size < WIDTH * HEIGHT / 4) {
        return create(random(), player)
    }
    fillSmallCaves()

    const actors = createActors()

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
        const types = {}
        forEachPos(pos => {
            types[pos] = 'wall'
        })
        types[player.pos] = 'floor'
        return types
    }

    /** return a dict of positions to actor ids */
    function createActors() {
        const actors = {}
        actors[player.pos] = player.id
        return actors
    }

    /** whether the tile at [pos] is a floor tile */
    function isFloor(pos) {
        return types[pos] === 'floor'
    }

    /** whether the tile at [pos] is passable */
    function passable(pos) {
        return types[pos] === 'floor'// || types[pos] === '.'SHALLOW_WATER
    }

    /** whether the tile at [pos] is a wall tile */
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

    /** use an (almost) cellular automaton to generate caves */
    function carveCaves() {
        const innerPositions = [];
        forEachInnerPos(pos => innerPositions.push(pos))
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = 'floor'
            }
        })
    }

    /** remove groups of 5 or fewer walls */
    function removeSmallWalls() {
        const visited = new Set()
        forEachInnerPos(pos => {
            const wallGroup = new Set()
            const floodable = (pos) => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos)
            const flood = (pos) => {
                visited.add(pos)
                wallGroup.add(pos)
            }
            floodfill(pos, floodable, flood)

            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    types[pos] = 'floor'
                }
            }
        })
    }

    /** remove disconnected caves */
    function removeOtherCaves() {
        const mainCave = new Set()
        floodfillSet(player.pos, passable, mainCave)

        forEachInnerPos(pos => {
            if (types[pos] === 'floor' && !mainCave.has(pos)) {
                types[pos] = 'wall'
            }
        })

        return mainCave.size
    }

    /** whether the tile at [pos] is part of a cave */
    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, passable) === 1
    }

    /** whether the tile at [pos] is not part of a cave */
    function isNotCave(pos) {
        return isWall(pos) || countGroups(pos, passable) !== 1
    }

    /** whether the tile at [pos] is a dead end */
    function isDeadEnd(pos) {
        return isFloor(pos)
        && countGroups(pos, passable) === 1
        && surrounded(pos, isNotCave)
    }

    /** recursively fill a dead end */
    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            types[pos] = 'wall'
            forEachNeighbor(pos, neighbor => {
                if (pos === player.pos && passable(neighbor)) {
                    player.pos = neighbor
                }
                fillDeadEnd(neighbor)
            })
        }
    }

    /** remove 2-3 tile caves that are connected to the main cave */
    function fillSmallCaves() {
        // can't skip visited tiles here because previous caves can be affected
        // by the removal of later ones
        forEachInnerPos(pos => {
            fillDeadEnd(pos)
            const cave = new Set()
            floodfillSet(pos, isCave, cave)

            if (cave.size === 2 || cave.size === 3) {
                types[pos] = 'wall'
                for (const pos of cave) {
                    fillDeadEnd(pos)
                }
            }
        })
    }

    return {
        types,
        actors,
    }
}

/** return the minimum x coordinate for a given [y], inclusive */
function xmin(y) {
    return Math.floor((HEIGHT - y) / 2)
}

/** return the maximum x coordinate for a given [y], exclusive */
function xmax(y) {
    return WIDTH - Math.floor(y / 2)
}

/** whether [pos] is inside the level */
function inBounds(pos) {
    const {x, y} = pos2xy(pos)
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y)
}

/** whether [pos] is inside the level and not on the outer edge */
function inInnerBounds(pos) {
    const {x, y} = pos2xy(pos)
    return y > 0 && y < HEIGHT - 1 && x > xmin(y) && x < xmax(y) - 1
}

/** call [fun] for each position in the level */
export function forEachPos(fun) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y)
        const max = xmax(y)
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}

/** call [fun] for each position in the level except the outer edge */
function forEachInnerPos(fun) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1
        const max = xmax(y) - 1
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}