package com.albertford.mob

import com.albertford.util.Direction
import com.albertford.Level
import com.albertford.util.Pos

class Hive : Mob {
    override var pos: Pos = Pos(0, 0)
    override var facingRight: Boolean = false
    override var lastMove: Direction? = null

    override fun move(level: Level, direction: Direction): Boolean {
        return false
    }

}