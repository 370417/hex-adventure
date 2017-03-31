/** @file constants for map tiles */

export type TileName = 'wall' | 'floor' | 'shortGrass' | 'tallGrass'

type TileData<T> = Record<TileName, T>

export const transparency: TileData< 0 | 1 | 2> = {
    wall: 0,
    floor: 2,
    shortGrass: 2,
    tallGrass: 1,
}

export const canWalk: TileData<boolean> = {
    wall: false,
    floor: true,
    shortGrass: true,
    tallGrass: true,
}
