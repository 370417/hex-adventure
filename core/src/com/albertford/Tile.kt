package com.albertford

import com.badlogic.gdx.utils.Array

class Tile(var terrain: Terrain, var mob: Mob? = null) {
    val projectiles = Array<Any>(2)
}

enum class Terrain(
        val passable: Boolean,
        val transparent: Boolean
) {
    FLOOR(
            passable = true,
            transparent = true
    ),
    WALL(
            passable = false,
            transparent = false
    ),
    SHORT_GRASS(
            passable = true,
            transparent = true
    ),
    TALL_GRASS(
            passable = true,
            transparent = false
    ),
    CLOSED_DOOR(
            passable = false,
            transparent = false
    ),
    OPEN_DOOR(
            passable = true,
            transparent = true
    ),
    EXIT(
            passable = false,
            transparent = true
    ),
    EXIT_LOCKED(
            passable = false,
            transparent = true
    )
}
