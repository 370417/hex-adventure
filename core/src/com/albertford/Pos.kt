package com.albertford

data class Pos(val x: Int, val y: Int) {

    fun distance(pos: Pos): Int {
        return (this - pos).distance()
    }

    operator fun plus(displacement: Displacement): Pos {
        return Pos(x + displacement.x, y + displacement.y)
    }

    operator fun minus(displacement: Displacement): Pos {
        return Pos(x - displacement.x, y - displacement.y)
    }

    operator fun minus(pos: Pos): Displacement {
        return Displacement(x - pos.x, y - pos.y)
    }
}

data class Displacement(val x: Int, val y: Int) {

    operator fun plus(displacement: Displacement): Displacement {
        return Displacement(x + displacement.x, y + displacement.y)
    }

    operator fun times(scale: Int): Displacement {
        return Displacement(scale * x, scale * y)
    }

    fun distance(): Int {
        return (Math.abs(x) + Math.abs(y) + Math.abs(x + y)) / 2
    }
}
