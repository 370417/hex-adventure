package com.albertford

data class Axial(var x: Int, var y: Int) {

    operator fun plus(axial: Axial): Axial {
        return Axial(x + axial.x, y + axial.y)
    }

    operator fun times(n: Int): Axial {
        return Axial(n * x, n * y)
    }
}
