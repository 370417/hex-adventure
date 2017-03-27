import { dir1, dir3, dir5, dir7, dir9, dir11 } from '../data/constants'

/** @file calculates fov */

const normals = [dir1, dir3, dir5, dir7, dir9, dir11]
const tangents = [dir5, dir7, dir9, dir11, dir1, dir3]

/**
 * calculate fov using recursive shadowcasting
 * @param center orgin of fov
 * @param transparent whether the tile at pos is transpaernt
 * @param reveal add pos to the fov
 */
export function shadowcast(center: number, transparent: (pos: number) => boolean, reveal: (pos: number) => void) {
    reveal(center)
    for (let i = 0; i < 6; i++) {
        const transform = (x: number, y: number) => center + x * tangents[i] + y * normals[i]
        const transformedTransparent = (x: number, y: number) => transparent(transform(x, y))
        const transformedReveal = (x: number, y: number) => reveal(transform(x, y))
        scan(1, 0, 1, transformedTransparent, transformedReveal)
    }
}

/** round a number, rounding up if it ends in .5 */
function roundHigh(n: number) {
    return Math.round(n)
}

/** round a number, rounding down if it ends in .5 */
function roundLow(n: number) {
    return Math.ceil(n - 0.5)
}

/**
 * Calculate a 60 degree sector of fov by recursively scanning rows.
 * @param y Distance from center of fov to the row being scanned
 * @param start Slope of starting angle expressed as x / y
 * @param end Slope of ending angle expressed as x / y
 * @param transparent Whether the tile at (x, y) is transparent
 * @param reveal Add the tile at (x, y) to the fov
 */
function scan(
    y: number,
    start: number,
    end: number,
    transparent: (x: number, y: number) => boolean,
    reveal: (x: number, y: number) => void,
) {
    if (start >= end) return

    // minimum and maximum x coordinates for opaque tiles
    // the fov for transparent tiles is slightly narrower to presernve symmetry
    const xmin = roundHigh(y * start)
    const xmax = roundLow(y * end)

    // whether the current continous fov has transparent tiles
    // this is used to prevent disjoint fov
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
