package com.albertford

data class Pos(var x: Int, var y: Int) {

    // Not operator because it would conflict with plus.
    // Can't use plus because plus doesn't mutate.
    fun plusAssign(pos: Pos) {
        x += pos.x
        y += pos.y
    }

    fun distance(pos: Pos): Int {
        return (Math.abs(x - pos.x) + Math.abs(y - pos.y) + Math.abs(x + y - pos.x - pos.y)) / 2
    }

    override fun equals(other: Any?): Boolean {
        return other is Pos && other.x == x && other.y == y
    }

    operator fun plus(pos: Pos): Pos {
        return Pos(x + pos.x, y + pos.y)
    }

    operator fun minus(pos: Pos): Pos {
        return Pos(x - pos.x, y - pos.y)
    }

    operator fun times(n: Int): Pos {
        return Pos(n * x, n * y)
    }

    override fun toString(): String {
        return "($x, $y)"
    }
}
