import { Tile } from './tile'
import { Entity } from './entity'
import { floodfill, floodfillSet, countGroups, surrounded, forEachNeighbor, xy2pos, pos2xy } from './position'
import { shuffle } from './random'
import Alea from 'alea'

/// handles level generation and iteration

export interface Level {
    types: {[pos: number]: Tile},
    actors: {[pos: number]: number},
}

export const WIDTH = 48
export const HEIGHT = 31

/// create a new level
export function createLevel(seed: number, player: Entity): Level {
    const random = Alea(seed)
    const types = createTypes()
    const weights = createRandomWeights()
    const actors = createActors()

    //makeLakes()
    carveCaves()
    removeSmallWalls()
    const size = removeOtherCaves()
    console.log(size)
    if (size < WIDTH * HEIGHT / 4) {
        return createLevel(random(), player)
    }
    fillSmallCaves()

    /// return a dict of positions to a random number
    function createRandomWeights() {
        const weights: {[pos: number]: number} = {}
        forEachInnerPos(pos => {
            weights[pos] = random()
        })
        return weights
    }

    /// return a dict of positions to tile types
    /// all tiles are initially walls except for the player's position, which is a floor
    function createTypes() {
        const types: {[pos: number]: Tile} = {}
        forEachPos(pos => {
            types[pos] = 'wall'
        })
        types[player.pos] = 'floor'
        return types
    }

    /// return a dict of positions to actor ids
    function createActors() {
        const actors: {[pos: number]: number} = {}
        actors[player.pos] = player.id
        return actors
    }

    /// whether the tile at [pos] is a floor tile
    function isFloor(pos: number): boolean {
        return types[pos] === 'floor'
    }

    /// whether the tile at [pos] is passable
    function passable(pos: number): boolean {
        return types[pos] === 'floor'// || types[pos] === '.'SHALLOW_WATER
    }

    /// whether the tile at [pos] is a wall tile
    function isWall(pos: number): boolean {
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
    function carveCaves(): void {
        const innerPositions: Array<number> = [];
        forEachInnerPos(pos => innerPositions.push(pos))
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = 'floor'
            }
        })
    }

    /// remove groups of 5 or fewer walls
    function removeSmallWalls(): void {
        const visited = new Set<number>()
        forEachInnerPos(pos => {
            const wallGroup = new Set<number>()
            const floodable = (pos: number): boolean => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos)
            const flood = (pos: number): void => {
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

    /// remove disconnected caves
    function removeOtherCaves(): number {
        const mainCave = new Set()
        floodfillSet(player.pos, passable, mainCave)

        forEachInnerPos(pos => {
            if (types[pos] === 'floor' && !mainCave.has(pos)) {
                types[pos] = 'wall'
            }
        })

        return mainCave.size
    }

    /// whether the tile at [pos] is part of a cave
    function isCave(pos: number): boolean {
        return isFloor(pos) && countGroups(pos, passable) === 1
    }

    /// whether the tile at [pos] is not part of a cave
    function isNotCave(pos: number): boolean {
        return isWall(pos) || countGroups(pos, passable) !== 1
    }

    /// whether the tile at [pos] is a dead end
    function isDeadEnd(pos: number): boolean {
        return isFloor(pos)
        && countGroups(pos, passable) === 1
        && surrounded(pos, isNotCave)
    }

    /// recursively fill a dead end
    function fillDeadEnd(pos: number): void {
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

    /// remove 2-3 tile caves that are connected to the main cave
    function fillSmallCaves(): void {
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

/// return the minimum x coordinate for a given [y], inclusive
function xmin(y: number): number {
    return Math.floor((HEIGHT - y) / 2)
}

/// return the maximum x coordinate for a given [y], exclusive
function xmax(y: number): number {
    return WIDTH - Math.floor(y / 2)
}

/// whether [pos] is inside the level
function inBounds(pos: number): boolean {
    const {x, y} = pos2xy(pos)
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y)
}

/// whether [pos] is inside the level and not on the outer edge
function inInnerBounds(pos: number): boolean {
    const {x, y} = pos2xy(pos)
    return y > 0 && y < HEIGHT - 1 && x > xmin(y) && x < xmax(y) - 1
}

interface posCallback {
    (pos: number, x: number, y: number): any
}

/// call [fun] for each position in the level
export function forEachPos(fun: posCallback): void {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y)
        const max = xmax(y)
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}

/// call [fun] for each position in the level except the outer edge
function forEachInnerPos(fun: posCallback): void {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1
        const max = xmax(y) - 1
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}