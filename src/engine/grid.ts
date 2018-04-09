import { xDirections, yDirections } from '../data/constants'

import { Grid } from '../types/game';

/** @file helper functions for working with grids */

export function createGrid<T>(width: number, height: number, fun: (x: number, y: number) => T): Grid<T> {
    const grid: Grid<T> = [];
    for (let y = 0; y < height; y++) {
        const row: {[x: number]: T} = {};
        const min = minX(height, y);
        const max = maxX(width, y);
        for (let x = min; x < max; x++) {
            row[x] = fun(x, y);
        }
        grid[y] = row;
    }
    return grid;
}

/** whether a position is inside the grid */
export function inBounds(width: number, height: number, x: number, y: number) {
    return y >= 0 && y < height && x >= minX(height, y) && x < maxX(width, y);
}

/** whether a position is inside the grid and not on the outer edge */
export function inInnerBounds(width: number, height: number, x: number, y: number) {
    return y > 0 && y < height - 1 && x > minX(height, y) && x < maxX(width, y) - 1;
}

/** call [fun] for each position in the grid */
export function forEachPos(width: number, height: number, fun: (x: number, y: number) => void) {
    for (let y = 0; y < height; y++) {
        const min = minX(height, y);
        const max = maxX(width, y);
        for (let x = min; x < max; x++) {
            fun(x, y);
        }
    }
}

/** call [fun] for each position in the grid except the outer edge */
export function forEachInnerPos(width: number, height: number, fun: (x: number, y: number) => void) {
    for (let y = 1; y < height - 1; y++) {
        const min = minX(height, y) + 1;
        const max = maxX(width, y) - 1;
        for (let x = min; x < max; x++) {
            fun(x, y);
        }
    }
}

/** whether a function returns true for all neighbors of a position */
export function surrounded(x: number, y: number, predicate: (x: number, y: number) => boolean) {
    for (let i = 0; i < 6; i++) {
        if (!predicate(x + xDirections[i], y + yDirections[i])) {
            return false;
        }
    }
    return true;
}

/** call a function for each neighbor of a position */
export function forEachNeighbor(x: number, y: number, callback: (x: number, y: number) => void) {
    for (let i = 0; i < 6; i++) {
        callback(x + xDirections[i], y + yDirections[i]);
    }
}

/** return the number of contiguous groups of tiles around a [pos] that satisfy [ingroup] */
export function countGroups(x: number, y: number, ingroup: (pos: number) => boolean) {
    let groupcount = 0;
    for (let i = 0; i < 6; i++) {
        const curr = directions[i];
        const next = directions[(i+1)%6];
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1;
        }
    }
    if (groupcount) {
        return groupcount;
    } else {
        return Number(ingroup(pos + dir1));
    }
}

/** return the minimum x coordinate of a row, inclusive */
function minX(height: number, y: number) {
    return Math.floor((height - y) / 2);
}

/** return the maximum x coordinate of a row, exclusive */
function maxX(width: number, y: number) {
    return width - Math.floor(y / 2);
}
