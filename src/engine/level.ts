import { WIDTH, HEIGHT } from '../data/constants'
import { TileName } from '../data/tile'

import { floodfill, floodfillSet, countGroups, surrounded, forEachNeighbor, xy2pos, pos2xy } from './position'
import { shuffle } from './random'
import { Components } from './components'
import { shadowcast } from './fov'

import Alea from '../lib/alea'
import * as Noise from '../lib/noise'

/** @file handles level generation and iteration */

export interface Level {
    tiles: {[pos: number]: TileName}
    mobs: {[pos: number]: number}
}

/** create a new level */
export function create(seed: any, player: number, components: Components): Level {
    const {position} = components

    const random = Alea(seed)
    Noise.seed(random())

    const tiles = createTiles()
    // const weights = createRandomWeights() // for lakes

    //makeLakes()
    carveCaves()
    removeSmallWalls()
    const size = removeOtherCaves()
    if (size < WIDTH * HEIGHT / 4) {
        return create(random(), player, components)
    }
    fillSmallCaves()
    const visibility = generateVisibility()
    placeGrass()

    const mobs = createMobs()

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
    function createTiles() {
        const types: {[pos: number]: TileName} = {}
        forEachPos(pos => {
            types[pos] = 'wall'
        })
        types[position[player]] = 'floor'
        return types
    }

    /** return a dict of positions to actor ids */
    function createMobs() {
        const mobs: {[pos: number]: number} = {}
        mobs[position[player]] = player
        return mobs
    }

    /** whether the tile at [pos] is a floor tile */
    function isFloor(pos: number) {
        return tiles[pos] === 'floor'
    }

    /** whether the tile at [pos] is passable */
    function passable(pos: number) {
        return tiles[pos] === 'floor'// || tiles[pos] === '.'SHALLOW_WATER
    }

    /** whether the tile at [pos] is a wall tile */
    function isWall(pos: number) {
        return inBounds(pos) && tiles[pos] === 'wall'
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
        const innerPositions: number[] = [];
        forEachInnerPos(pos => innerPositions.push(pos))
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                tiles[pos] = 'floor'
            }
        })
    }

    /** remove groups of 5 or fewer walls */
    function removeSmallWalls() {
        const visited = new Set()
        forEachInnerPos(pos => {
            const wallGroup = new Set()
            const floodable = (pos: number) => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos)
            const flood = (pos: number) => {
                visited.add(pos)
                wallGroup.add(pos)
            }
            floodfill(pos, floodable, flood)

            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    tiles[pos] = 'floor'
                }
            }
        })
    }

    /** remove disconnected caves */
    function removeOtherCaves() {
        const mainCave = new Set()
        floodfillSet(position[player], passable, mainCave)

        forEachInnerPos(pos => {
            if (tiles[pos] === 'floor' && !mainCave.has(pos)) {
                tiles[pos] = 'wall'
            }
        })

        return mainCave.size
    }

    /** whether the tile at [pos] is part of a cave */
    function isCave(pos: number) {
        return isFloor(pos) && countGroups(pos, passable) === 1
    }

    /** whether the tile at [pos] is not part of a cave */
    function isNotCave(pos: number) {
        return isWall(pos) || countGroups(pos, passable) !== 1
    }

    /** whether the tile at [pos] is a dead end */
    function isDeadEnd(pos: number) {
        return isFloor(pos)
        && countGroups(pos, passable) === 1
        && surrounded(pos, isNotCave)
    }

    /** recursively fill a dead end */
    function fillDeadEnd(pos: number) {
        if (isDeadEnd(pos)) {
            tiles[pos] = 'wall'
            forEachNeighbor(pos, neighbor => {
                if (pos === position[player] && passable(neighbor)) {
                    position[player] = neighbor
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
                tiles[pos] = 'wall'
                for (const pos of cave) {
                    fillDeadEnd(pos)
                }
            }
        })
    }

    /** Find the number of tiles visible from each tile */
    function generateVisibility() {
        const visibility: {[pos: number]: number} = {}
        forEachInnerPos(pos => {
            let fov = new Set()
            const transparent = (pos: number) => tiles[pos] === 'floor'
            const reveal = (pos: number) => fov.add(pos)
            if (transparent(pos)) {
                shadowcast(pos, transparent, reveal)
            }
            visibility[pos] = fov.size
        })
        return visibility
    }

    function placeGrass() {
        forEachInnerPos((pos, x, y) => {
            if (tiles[pos] === 'wall') {
                return
            }
            const z = 0 - x - y
            const zoom = 10
            // random simplex number between 0 and 2
            const noise = Noise.simplex3(x / zoom, y / zoom, z / zoom) + 1
            if (visibility[pos] < 40 * noise) {
                tiles[pos] = 'tallGrass'
            } else if (visibility[pos] < 60 * noise) {
                tiles[pos] = 'shortGrass'
            }
        })
    }

    return {
        tiles,
        mobs,
    }
}

/** return the minimum x coordinate for a given [y], inclusive */
function xmin(y: number) {
    return Math.floor((HEIGHT - y) / 2)
}

/** return the maximum x coordinate for a given [y], exclusive */
function xmax(y: number) {
    return WIDTH - Math.floor(y / 2)
}

/** whether [pos] is inside the level */
function inBounds(pos: number) {
    const {x, y} = pos2xy(pos)
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y)
}

/** whether [pos] is inside the level and not on the outer edge */
function inInnerBounds(pos: number) {
    const {x, y} = pos2xy(pos)
    return y > 0 && y < HEIGHT - 1 && x > xmin(y) && x < xmax(y) - 1
}

/** call [fun] for each position in the level */
export function forEachPos(fun: (pos: number, x: number, y: number) => void) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y)
        const max = xmax(y)
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}

/** call [fun] for each position in the level except the outer edge */
function forEachInnerPos(fun: (pos: number, x: number, y: number) => void) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1
        const max = xmax(y) - 1
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}
