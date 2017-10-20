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
    private val exit = atlas.findRegion("exit")
    private val exitLocked = atlas.findRegion("exitLocked")

    private val letters = TextureRegion.split(font, 9, 16)

    private val player = atlas.findRegion("skunk")

    private val key = atlas.findRegion("key")

    private val sprites = Grid(gameState.level.tiles.width, gameState.level.tiles.height) { i ->
        val (x, y) = gameState.level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (9 * x).toFloat()
        sprite.y = (16 * y + 16).toFloat()
        sprite
    }

    private var bottomText: String? = null

    private val commandBuffer = ArrayList<Command>()

    init {
        Gdx.input.inputProcessor = Input(this)
    }

    fun runCommand(command: Command) {
        when (command) {
            Command.MOVE_SOUTHEAST -> gameState.movePlayer(Grid.SOUTHEAST)
            Command.MOVE_SOUTHWEST -> gameState.movePlayer(Grid.SOUTHWEST)
            Command.MOVE_EAST -> gameState.movePlayer(Grid.EAST)
            Command.MOVE_WEST -> gameState.movePlayer(Grid.WEST)
            Command.MOVE_NORTHEAST -> gameState.movePlayer(Grid.NORTHEAST)
            Command.MOVE_NORTHWEST -> gameState.movePlayer(Grid.NORTHWEST)
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
                val item = tile.item
                when {
                    mob != null -> {
                        sprite.setRegion(player)
                        sprite.setFlip(mob.facingRight, false)
                    }
                    item != null -> {
                        sprite.setRegion(itemRegion(item))
                    }
                    else -> {
                        sprite.setRegion(terrainRegion(tile.terrain))
                    }
                }
                sprite.draw(batch)
            } else if (tileView.lastSeen > gameState.firstTurn) {
                sprite.setColor(0.5f, 0.5f, 0.5f, 1f)
                sprite.setRegion(terrainRegion(tileView.terrain))
                sprite.draw(batch)
            }
        }
        bottomText = "Skealkh"
        bottomText?.forEachIndexed { i, char ->
            val texture = charToTexture(char)
            if (texture != null) {
                batch.draw(charToTexture(char), 9f * i + 10f, 0f)
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
            Terrain.EXIT -> exit
            Terrain.EXIT_LOCKED -> exitLocked
        }
    }

    private  fun itemRegion(item: Item): TextureRegion {
        return when (item) {
            Item.KEY -> key
        }
    }

    private fun charToTexture(char: Char): TextureRegion? {
        val int = char.toInt()
        return when (int) {
            44 -> letters[0][13]
            46 -> letters[1][13]
            63 -> letters[2][13]
            in 97..109 -> letters[0][int - 97]
            in 110..122 -> letters[1][int - 110]
            in 65..77 -> letters[2][int - 65]
            in 78..90 -> letters[3][int - 78]
            in 48..57 -> letters[4][int - 48]
            else -> null
        }
    }
}
