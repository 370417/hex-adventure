import { dir1, dir11, dir3, dir5, dir7, dir9, directions, WIDTH } from '../data/constants';

/** @file helper functions for working with positions */

/** return the distance between (x1, y1) and (x2, y2) */
export function calcDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * [flood] from [pos] as long as neighbors are [floodable]
 * it is up to [flood] to make sure that [floodable] returns false for visited positions
 */
export function floodfill(pos: number, floodable: (pos: number) => boolean, flood: (pos: number) => void) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}

/**
 * flood from [pos] as long as neighbors are [passable]
 * [visited] keeps track of what positions have already been flooded, and is normally set to empty
 */
export function floodfillSet(pos: number, passable: (pos: number) => boolean, visited: Set<number>) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, (neighbor) => {
            floodfillSet(neighbor, passable, visited);
        });
    }
}

export function approximateDirection(pos1: number, pos2: number): number {
    const {x: x1, y: y1} = pos2xy(pos1);
    const {x: x2, y: y2} = pos2xy(pos2);
    const z1 = -x1 - y1;
    const z2 = -x2 - y2;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const dz = Math.abs(z2 - z1);
    if (dx >= dy && dx >= dz) {
        return xy2pos(sign(x2 - x1), 0);
    } else if ()
}

function sign(n: number): number {
    if (n > 0) {
        return 1;
    } else if (n < 0) {
        return -1;
    } else {
        return 0;
    }
}
