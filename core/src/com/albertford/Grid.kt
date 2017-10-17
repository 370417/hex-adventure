package com.albertford

/**
 * Rectangular hexagonal grid.
 * Origin is (0, 0) at the bottom left corner.
 * X-axis is horizontal right. Y-axis is diagonal up and left to avoid negative numbers.
 */

// Example
//   width = 6
//   height = 7

// 3,6 4,6 5,6 6,6 7,6 8,6
//   3,5 4,5 5,5 6,5 7,5 8,5
// 2,4 3,4 4,4 5,4 6,4 7,4
//   2,3 3,3 4,3 5,3 6,3 7,3
// 1,1 2,2 3,2 4,2 5,2 6,2
//   1,1 2,1 3,1 4,1 5,1 6,1
// 0,0 1,0 2,0 3,0 4,0 5,0

class Grid<T>(val width: Int, val height: Int, init: (i: Int) -> T) {

    @Suppress("UNCHECKED_CAST")
    private val arr = Array(width * height) { init(it) as Any } as Array<T>

    operator fun get(i: Int): T {
        return arr[i]
    }

    operator fun get(x: Int, y: Int): T {
        return arr[axialToLinear(x, y)]
    }

    operator fun get(axial: Axial): T {
        return arr[axialToLinear(axial.x, axial.y)]
    }

    operator fun set(i: Int, t: T) {
        arr[i] = t
    }

    operator fun set(x: Int, y: Int, t: T) {
        arr[axialToLinear(x, y)] = t
    }

    operator fun set(axial: Axial, t: T) {
        arr[axialToLinear(axial.x, axial.y)] = t
    }

    fun inBounds(x: Int, y: Int): Boolean {
        return y in 0 until height && x - axialFirstX(y) in 0 until width
    }

    fun inInnerBounds(x: Int, y: Int): Boolean {
        return y in 1..height - 2 && x - axialFirstX(y) in 1..width - 2
    }

    fun forEach(function: (t: T, i: Int) -> Unit) {
        for (i in arr.indices) {
            function(arr[i], i)
        }
    }

    /**
     * Origin for rectangular coordinates is also at the bottom left.
     * Adjacent tiles on the same row are offset by 2 in the x axis.
     * Adjacent tiles on neighboring rows are offset by 1 in the x axis.
     */
    fun linearToRectangular(i: Int): Rectangular {
        val y = i / width
        val x = (y % 2) + 2 * (i % width)
        return Rectangular(x, y)
    }

    fun linearToAxial(i: Int): Axial {
        val y = i / width
        return Axial((i % width) + axialFirstX(y), y)
    }

    fun axialToLinear(x: Int, y: Int): Int {
        return y * width + x - axialFirstX(y)
    }

    fun floodfill(x: Int, y: Int, floodable: (x: Int, y: Int) -> Boolean, flood: (x: Int, y: Int) -> Unit) {
        if (inBounds(x, y) && floodable(x, y)) {
            flood(x, y)
            for ((dx, dy) in directions) {
                floodfill(x + dx, y + dy, floodable, flood)
            }
        }
    }

    /* Find the value of the first x-coordinate of a given row */
    private fun axialFirstX(y: Int): Int {
        return (y + 1) / 2
    }

    companion object {
        // The six unit vectors, ordered clockwise starting from the top right
        val directions = arrayOf(
                Axial(1, 1),
                Axial(1, 0),
                Axial(0, -1),
                Axial(-1, -1),
                Axial(-1, 0),
                Axial(0, 1)
        )

        private val tangents = arrayOf(
                directions[2],
                directions[3],
                directions[4],
                directions[5],
                directions[0],
                directions[1]
        )

        fun shadowcast(center: Axial, transparent: (axial: Axial) -> Boolean, reveal: (axial: Axial) -> Unit) {
            reveal(center)
            for (i in 0 until 6) {
                val transform = { x: Int, y: Int ->
                    center + tangents[i] * x + directions[i] * y
                }
                scan(1, 0f, 1f, { x, y ->
                    transparent(transform(x, y))
                }, { x, y ->
                    reveal(transform(x, y))
                })
            }
        }

        private fun roundHigh(n: Float): Int {
            return Math.round(n)
        }

        private fun roundLow(n: Float): Int {
            return if (n % 1 == 0.5f) {
                Math.round(n) - 1
            } else {
                Math.round(n)
            }
        }

        private fun scan(y: Int, start: Float, end: Float,
                         transparent: (x: Int, y: Int) -> Boolean,
                         reveal: (x: Int, y: Int) -> Unit) {
            @Suppress("NAME_SHADOWING")
            var start = start
            var fovExists = false
            for (x in roundHigh(y * start)..roundLow(y * end)) {
                if (transparent(x, y)) {
                    if (x >= y * start && x <= y * end) {
                        reveal(x, y)
                        fovExists = true
                    }
                } else {
                    val newEnd = (x - 0.5f) / y
                    if (fovExists && start < newEnd) {
                        scan(y + 1, start, newEnd, transparent, reveal)
                    }
                    reveal(x, y)
                    fovExists = false
                    start = (x + 0.5f) / y
                    if (start >= end) return
                }
            }
            if (fovExists && start < end) {
                scan(y + 1, start, end, transparent, reveal)
            }
        }
    }

}
