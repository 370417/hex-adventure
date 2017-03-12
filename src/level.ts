import { Tile } from './tile'
import { Entity } from 'entity'
import { floodfill, floodfillSet, countGroups, surrounded, forEachNeighbor, xy2pos, pos2xy } from './position'
import { shuffle } from './random'
import Alea from 'alea'

export interface Level {
    types: {[pos: number]: Tile},
    actors: {[pos: number]: Entity},
}

export const WIDTH = 48
export const HEIGHT = 31

export function createLevel(seed: number, player: Entity): Level {
    const random = Alea(seed)
    const types = createTypes()
    const weights = createRandomWeights()
    const actors = createActors()

    //makeLakes()
    carveCaves()
    removeSmallWalls()
    const size = removeOtherCaves()
    if (size < WIDTH * HEIGHT / 4) {
        return createLevel(random(), player)
    }
    fillSmallCaves()

    function createRandomWeights() {
        const weights: {[pos: number]: number} = {}
        forEachInnerPos(pos => {
            weights[pos] = random()
        })
        return weights
    }

    function createTypes() {
        const types: {[pos: number]: Tile} = {}
        forEachPos(pos => {
            types[pos] = Tile.wall
        })
        types[player.pos] = Tile.floor
        return types
    }

    function createActors() {
        const actors: {[pos: number]: Entity} = {}
        actors[player.pos] = player
        return actors
    }

    function isFloor(pos: number): boolean {
        return types[pos] === Tile.floor
    }

    function passable(pos: number): boolean {
        return types[pos] === Tile.floor// || types[pos] === Tiles.SHALLOW_WATER
    }

    function isWall(pos: number): boolean {
        return inBounds(pos) && types[pos] === Tile.wall
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

    function carveCaves(): void {
        const innerPositions: Array<number> = [];
        forEachInnerPos(pos => innerPositions.push(pos))
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                types[pos] = Tile.floor
            }
        })
    }

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
                    types[pos] = Tile.floor
                }
            }
        })
    }

    function removeOtherCaves(): number {
        const mainCave = new Set()
        floodfillSet(player.pos, passable, mainCave)

        forEachInnerPos(pos => {
            if (types[pos] === Tile.floor && !mainCave.has(pos)) {
                types[pos] = Tile.wall
            }
        })

        return mainCave.size
    }

    function isCave(pos: number): boolean {
        return isFloor(pos) && countGroups(pos, passable) === 1
    }

    function isNotCave(pos: number): boolean {
        return isWall(pos) || countGroups(pos, passable) !== 1
    }

    function isDeadEnd(pos: number): boolean {
        return isFloor(pos)
        && countGroups(pos, passable) === 1
        && surrounded(pos, isNotCave)
    }

    function fillDeadEnd(pos: number): void {
        if (isDeadEnd(pos)) {
            types[pos] = Tile.wall
            forEachNeighbor(pos, neighbor => {
                if (pos === player.pos && passable(neighbor)) {
                    player.pos = neighbor
                }
                fillDeadEnd(neighbor)
            })
        }
    }

    function fillSmallCaves(): void {
        // can't skip visited tiles here because previous caves can be affected
        // by the removal of later ones
        forEachInnerPos(pos => {
            fillDeadEnd(pos)
            const cave = new Set()
            floodfillSet(pos, isCave, cave)

            if (cave.size === 2 || cave.size === 3) {
                types[pos] = Tile.wall
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

function xmin(y: number): number {
    return Math.floor((HEIGHT - y) / 2)
}

function xmax(y: number): number {
    return WIDTH - Math.floor(y / 2)
}

function inBounds(pos: number): boolean {
    const {x, y} = pos2xy(pos)
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y)
}

function inInnerBounds(pos: number): boolean {
    const {x, y} = pos2xy(pos)
    return y > 0 && y < HEIGHT - 1 && x > xmin(y) && x < xmax(y) - 1
}

interface posCallback {
    (pos: number, x?: number, y?: number): any
}

export function forEachPos(fun: posCallback): void {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y)
        const max = xmax(y)
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}

function forEachInnerPos(fun: posCallback): void {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1
        const max = xmax(y) - 1
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y)
        }
    }
}
