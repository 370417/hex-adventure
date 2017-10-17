package com.albertford

class Tile(var terrain: Terrain, var mob: Mob? = null) {

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
    )
}
