package com.albertford

interface Mob {
    var pos: Pos
    var facingRight: Boolean
    var lastMove: Displacement

    fun move(level: Level, displacement: Displacement): Boolean
}

class Player : Mob {
    override var pos = Pos(0, 0)
    override var facingRight = false
    override var lastMove = Displacement(0, 0)
    var hasKey = false
    var sneaky = true

    override fun move(level: Level, displacement: Displacement): Boolean {
        facingRight = when (displacement) {
            Grid.EAST, Grid.NORTHEAST, Grid.SOUTHEAST -> true
            else -> false
        }
        val targetTile = level.tiles[pos + displacement]
        if (!targetTile.terrain.passable || targetTile.mob != null) {
            return false
        }
        level.tiles[pos].mob = null
        pos += displacement
        level.tiles[pos].mob = this
        lastMove = displacement
        return true
    }
}
