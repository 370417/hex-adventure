import { dir1, dir3, dir5, dir7, dir9, dir11 } from '../data/constants'

/** @file calculates fov */

const normals = [dir1, dir3, dir5, dir7, dir9, dir11]
const tangents = [dir5, dir7, dir9, dir11, dir1, dir3]

export function fov(center, transparent, reveal) {
    reveal(center)
    for (let i = 0; i < 6; i++) {
        const transform = (x, y) => center + x * normals[i] + y * tangents[i]
        const transformedTransparent = (x, y) => transparent(transform(x, y))
        const transformedReveal = (x, y) => reveal(transform(x, y))
        scan(1, 0, 1, transformedTransparent, transformedReveal)
    }
}

/** round a number, rounding up if it ends in .5 */
function roundHigh(n) {
    return Math.round(n)
}

/** round a number, rounding down if it ends in .5 */
function roundLow(n) {
    return Math.ceil(n - 0.5)
}

/**
 * compute 60 degrees of fov
 * @param {number} y - distance
 * @param {number} start - proportion of 
 * @param {number} end - 
 */
function scan(y, start, end, transparent, reveal) {
    if (start >= end) return
    const xmin = roundHigh(y * start)
    const xmax = roundLow(y * end)
    let fovExists = false
    for (let x = xmin; x <= xmax; x++) {
        if (transparent(x, y)) {
            if (x >= y * start && x <= y * end) {
                reveal(x, y)
                fovExists = true
            }
        } else {
            if (fovExists) {
                scan(y + 1, start, (x - 0.5) / y, transparent, reveal)
            }
            reveal(x, y)
            fovExists = false
            start = (x + 0.5) / y
            if (start >= end) return
        }
    }
    if (fovExists) {
        scan(y + 1, start, end, transparent, reveal)
    }
}
