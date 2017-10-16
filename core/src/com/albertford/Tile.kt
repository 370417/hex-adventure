package com.albertford

import com.badlogic.gdx.graphics.g2d.TextureRegion

class Tile(var terrain: Terrain) {

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
