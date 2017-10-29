package com.albertford

/**
 * Rectangular hexagonal grid.
 * Origin is (0, 0) at the bottom left corner.
 */

class Grid<T>(val width: Int, val height: Int, init: (i: Int) -> T) {

    @Suppress("UNCHECKED_CAST")
    private val arr = Array(width * height) { init(it) as Any } as Array<T>

    operator fun get(i: Int): T {
        return arr[i]
    }

    operator fun get(pos: Pos): T {
        return arr[posToLinear(pos)]
    }

    operator fun set(i: Int, t: T) {
        arr[i] = t
    }

    operator fun set(pos: Pos, t: T) {
        arr[posToLinear(pos)] = t
    }

    private fun inBounds(pos: Pos): Boolean {
        val (x, y) = pos
        val row = x + y
        return row in 0 until height && x - rowFirstX(row) in 0 until width
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

    fun linearToPos(i: Int): Pos {
        val row = i / width
        val col = i % width
        return Pos(rowFirstX(row) + col, rowFirstY(row) - col)
    }

    fun posToLinear(pos: Pos): Int {
        val (x, y) = pos
        val row = x + y
        val col = x - rowFirstX(row)
        return row * width + col
    }

    fun floodfill(pos: Pos, floodable: (pos: Pos) -> Boolean, flood: (pos: Pos) -> Unit) {
        if (inBounds(pos) && floodable(pos)) {
            flood(pos)
            for (direction in directions) {
                floodfill(pos + direction, floodable, flood)
            }
        }
    }

    /* Find the value of the first x-coordinate of a given row */
    private fun rowFirstX(row: Int): Int {
        return (row + 1) / 2
    }

    /* Find the value of the first y-coordinate of a given row */
    private fun rowFirstY(row: Int): Int {
        return row / 2
    }

    companion object {
        val NORTHEAST = Displacement(1, 0)
        val EAST = Displacement(1, -1)
        val SOUTHEAST = Displacement(0, -1)
        val SOUTHWEST = Displacement(-1, 0)
        val WEST = Displacement(-1, 1)
        val NORTHWEST = Displacement(0, 1)

        // The six unit vectors, ordered clockwise starting from the top right
        val directions = arrayOf(NORTHEAST, EAST, SOUTHEAST, SOUTHWEST, WEST, NORTHWEST)

        private val tangents = arrayOf(SOUTHEAST, SOUTHWEST, WEST, NORTHWEST, NORTHEAST, EAST)

        fun shadowcast(center: Pos, transparent: (pos: Pos) -> Boolean, reveal: (pos: Pos) -> Unit) {
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
