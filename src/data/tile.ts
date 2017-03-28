/** @file constants for map tiles */

export type TileName = 'wall' | 'floor' | 'shortGrass' | 'tallGrass'

interface Tile {
    transparency: 0 | 1 | 2
    canWalk: boolean
}

export const Tiles: Record<TileName, Tile> = {
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
}
