package com.albertford

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.graphics.g2d.TextureRegion

class Display(private var gameState: GameState, atlas: TextureAtlas, font: Texture) {

    private val floor = atlas.findRegion("floor")
    private val wall = atlas.findRegion("wall")
    private val shortGrass = atlas.findRegion("shortGrass")
    private val tallGrass = atlas.findRegion("tallGrass")
    private val closedDoor = atlas.findRegion("closedDoor")
    private val openDoor = atlas.findRegion("openDoor")

    private val letters = TextureRegion.split(font, 9, 16)

    private val player = atlas.findRegion("player")

    private val sprites = Grid(gameState.level.tiles.width, gameState.level.tiles.height) { i ->
        val (x, y) = gameState.level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (9 * x).toFloat()
        sprite.y = (16 * y).toFloat()
        sprite
    }

    private val commandBuffer = ArrayList<Command>()

    init {
        Gdx.input.inputProcessor = Input(this)
    }

    fun runCommand(command: Command) {
        val level = gameState.level
        val player = gameState.player
        when (command) {
            Command.MOVE_SOUTHEAST -> movePlayer(Grid.SOUTHEAST)
            Command.MOVE_SOUTHWEST -> movePlayer(Grid.SOUTHWEST)
            Command.MOVE_EAST -> movePlayer(Grid.EAST)
            Command.MOVE_WEST -> movePlayer(Grid.WEST)
            Command.MOVE_NORTHEAST -> movePlayer(Grid.NORTHEAST)
            Command.MOVE_NORTHWEST -> movePlayer(Grid.NORTHWEST)
            Command.REST -> {}
            Command.DEBUG -> {
                gameState = GameState(gameState.level.tiles.width, gameState.level.tiles.height)
            }
        }
        gameState.updateFov()
        Gdx.graphics.requestRendering()
    }

    fun render(batch: Batch) {
        sprites.forEach { sprite, i: Int ->
            val tile = gameState.level.tiles[i]
            val tileView = gameState.fov[i]
            if (tileView.lastSeen == gameState.turn) {
                sprite.setColor(1f, 1f, 1f, 1f)
                val mob = tile.mob
                val region = when (mob) {
                    is Player -> player
                    else -> terrainRegion(tile.terrain)
                }
                sprite.setRegion(region)
                sprite.draw(batch)
            } else if (tileView.lastSeen >= 0) {
                sprite.setColor(0.5f, 0.5f, 0.5f, 1f)
                sprite.setRegion(terrainRegion(tileView.terrain))
                sprite.draw(batch)
            }
        }
    }

    private fun terrainRegion(terrain: Terrain): TextureRegion {
        return when (terrain) {
            Terrain.WALL -> wall
            Terrain.FLOOR -> floor
            Terrain.SHORT_GRASS -> shortGrass
            Terrain.TALL_GRASS -> tallGrass
            Terrain.CLOSED_DOOR -> closedDoor
            Terrain.OPEN_DOOR -> openDoor
        }
    }

    private fun movePlayer(direction: Axial) {
        if (!gameState.level.moveMob(gameState.player, direction)) {
            gameState.level.bump(gameState.player, direction)
        }
    }
}
