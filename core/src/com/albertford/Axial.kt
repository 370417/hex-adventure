package com.albertford

data class Axial(var x: Int, var y: Int) {

    fun sum(axial: Axial): Axial {
        return Axial(x + axial.x, y + axial.y)
    }
}
