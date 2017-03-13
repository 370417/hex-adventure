/// helper functions for working with positions

import Heap from 'heap'

const WIDTH = 48
const HEIGHT = 31

const dir1 = 1 - WIDTH
const dir3 = 1
const dir5 = WIDTH
const dir7 = -1 + WIDTH
const dir9 = -1
const dir11 = -WIDTH

const directions = [dir1, dir3, dir5, dir7, dir9, dir11]

/// convert the coordinate pair [x], [y] into an integer position
export function xy2pos(x: number, y: number): number {
    return x + y * WIDTH
}

/// convert an integer [pos] into the coordinate pair x, y
export function pos2xy(pos: number): {x: number, y: number} {
    return {
        x: pos % WIDTH,
        y: Math.floor(pos / WIDTH),
    }
}

/// return the number of contiguous groups of tiles around a [pos] that satisfy [ingroup]
export function countGroups(pos: number, ingroup: (pos: number) => boolean): number {
    // use var instead of let because
    // chrome can't optimize compound let assignment
    var groupcount = 0
    for (let i = 0; i < 6; i++) {
        const curr = directions[i]
        const next = directions[(i+1)%6]
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1
        }
    }
    if (groupcount) {
        return groupcount
    } else {
        return Number(ingroup(pos + dir1))
    }
}

/// 
export function floodfill(pos: number, floodable: (pos: number) => boolean, flood: (pos: number) => void): void {
    if (floodable(pos)) {
        flood(pos)
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood)
        }
    }
}


export function floodfillSet(pos: number, passable: (pos: number) => boolean, visited: Set<number>) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos)
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited)
        })
    }
}


export function surrounded(pos: number, istype: (pos: number) => boolean) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false
        }
    }
    return true
}


export function forEachNeighbor(pos: number, callback: (pos: number) => void): void {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i])
    }
}


export function flowmap(
    startpos: number,
    range: number,
    forEachNeighbor: (pos: number, callback: (pos: number) => void) => void,
    cost: (pos: number) => number
): Map<number, number> {
    const open = new Map<number, number>() // map of positions to net cost
    open.set(startpos, 0)
    const closed = new Map<number, number>()
    const openHeap = new Heap<number>((a, b) => open.get(a) - open.get(b))
    openHeap.push(startpos)

    while (!openHeap.empty()) {
        const pos = openHeap.pop()
        const netCost = open.get(pos)
        if (netCost > range) {
            return closed
        }
        open.delete(pos)
        closed.set(pos, netCost)

        forEachNeighbor(pos, neighbor => {
            if (!closed.has(neighbor)) {
                const altCost = netCost + cost(neighbor)
                if (!open.has(neighbor)) {
                    open.set(neighbor, altCost)
                    openHeap.push(neighbor)
                }
                else if (altCost < open.get(neighbor)) {
                    open.set(neighbor, altCost)
                    openHeap.update(neighbor)
                }
            }
        })
    }
    return closed
}