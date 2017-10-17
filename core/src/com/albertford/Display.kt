package com.albertford

import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.graphics.g2d.TextureRegion

class Display(private var gameState: GameState, atlas: TextureAtlas) {

    private val floor = atlas.findRegion("floor")
    private val wall = atlas.findRegion("wall")
    private val shortGrass = atlas.findRegion("shortGrass")
    private val tallGrass = atlas.findRegion("tallGrass")

    private val player = atlas.findRegion("player")

    private val sprites = Grid(gameState.level.tiles.width, gameState.level.tiles.height) { i ->
        val (x, y) = gameState.level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (9 * x).toFloat()
        sprite.y = (16 * y).toFloat()
        sprite
    }

    fun render(batch: Batch) {
        sprites.forEach { sprite, i: Int ->
            val tile = gameState.level.tiles[i]
            if (gameState.memory[i].visible) {
                val mob = tile.mob
                if (mob != null) {
                    sprite.setRegion(mobRegion(mob.type))
                } else {
                    sprite.setRegion(terrainRegion(tile.terrain))
                }
                sprite.draw(batch)

            } else {
                val tileMemory = gameState.memory[i]
                if (tileMemory.remembered) {
                    sprite.setRegion(terrainRegion(tileMemory.terrain))
                    sprite.draw(batch)
                }
            }
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

    private fun mobRegion(type: MobType): TextureRegion {
        return when (type) {
            MobType.PLAYER -> player
        }
    }

}
