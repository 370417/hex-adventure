package com.albertford

import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.graphics.g2d.TextureRegion

class Display(var level: Level, val atlas: TextureAtlas) {

    private val floor = atlas.findRegion("floor")
    private val wall = atlas.findRegion("wall")
    private val shortGrass = atlas.findRegion("shortGrass")
    private val tallGrass = atlas.findRegion("tallGrass")

    private val sprites = Grid(level.tiles.width, level.tiles.height) { i ->
        val (x, y) = level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (9 * x).toFloat()
        sprite.y = (16 * y).toFloat()
        sprite
    }

    fun render(batch: Batch) {
        sprites.forEach { sprite, i: Int ->
            val tile = level.tiles.get(i)
            sprite.setRegion(terrainRegion(tile.terrain))
            sprite.draw(batch)
        }
    }

    private fun terrainRegion(terrain: Terrain): TextureRegion {
        return when (terrain) {
            Terrain.WALL -> wall
            Terrain.FLOOR -> floor
            Terrain.SHORT_GRASS -> shortGrass
            Terrain.TALL_GRASS -> tallGrass
        }
    }

}
