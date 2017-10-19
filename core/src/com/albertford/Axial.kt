package com.albertford

data class Axial(var x: Int, var y: Int) {

    // Not operator because it would conflict with plus.
    // Can't use plus because plus doesn't mutate.
    fun plusAssign(axial: Axial) {
        x += axial.x
        y += axial.y
    }

    override fun equals(other: Any?): Boolean {
        return other is Axial && other.x == x && other.y == y
    }

    operator fun plus(axial: Axial): Axial {
        return Axial(x + axial.x, y + axial.y)
    }

    operator fun minus(axial: Axial): Axial {
        return Axial(x - axial.x, y - axial.y)
    }

    operator fun times(n: Int): Axial {
        return Axial(n * x, n * y)
    }
}
