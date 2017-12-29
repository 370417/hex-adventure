package com.albertford

import com.albertford.mob.Mob
import com.badlogic.gdx.utils.Array

class Tile(var terrain: Terrain, var mob: Mob? = null, var item: Item? = null)

class TileView(var lastSeen: Int, var terrain: Terrain, var item: Item?)

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
            passable = true,
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
    ),
    DEEP_WATER(
            passable = false,
            transparent = true
    ),
    SHALLOW_WATER(
            passable = true,
            transparent = true
    )
}

enum class Item {
    KEY, GOLD
}
