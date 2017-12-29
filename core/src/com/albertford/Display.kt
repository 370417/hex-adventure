package com.albertford

import com.albertford.mob.*
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.graphics.g2d.TextureRegion

private const val HALF_TILE_WIDTH = 9
private const val PART_TILE_HEIGHT = 16
private const val FULL_TILE_HEIGHT = 24

class Display(private var gameState: GameState, atlas: TextureAtlas, font: Texture) {

    private val wall = atlas.findRegion("wall")
    private val floor = atlas.findRegion("floor")
    private val shortGrass = atlas.findRegion("shortGrass")
    private val tallGrass = atlas.findRegion("tallGrass")
    private val closedDoor = atlas.findRegion("closedDoor")
    private val openDoor = atlas.findRegion("openDoor")
    private val exit = atlas.findRegion("exit")
    private val exitLocked = atlas.findRegion("exitLocked")
    private val water = atlas.findRegion("water")

    private val letters = TextureRegion.split(font, HALF_TILE_WIDTH, PART_TILE_HEIGHT)

    private val player = atlas.findRegion("player")
    private val hive = atlas.findRegion("hive")
    private val acolyte = atlas.findRegion("acolyte")

    private val key = atlas.findRegion("key")
    private val gold = atlas.findRegion("gold")

    private val sprites = Grid(gameState.level.tiles.width, gameState.level.tiles.height) { i ->
        val (x, y) = gameState.level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (HALF_TILE_WIDTH * x).toFloat()
        sprite.y = (PART_TILE_HEIGHT * (gameState.level.tiles.height - y - 1)).toFloat()
        sprite
    }

    private var mouseLocation: Pos? = null

    private var bottomText: String? = null

    init {
        Gdx.input.inputProcessor = Input(this)
    }

    fun runCommand(command: Command) {
        when (command) {
            Command.MOVE_SOUTHEAST -> gameState.movePlayer(Direction.SOUTHEAST)
            Command.MOVE_SOUTHWEST -> gameState.movePlayer(Direction.SOUTHWEST)
            Command.MOVE_EAST -> gameState.movePlayer(Direction.EAST)
            Command.MOVE_WEST -> gameState.movePlayer(Direction.WEST)
            Command.MOVE_NORTHEAST -> gameState.movePlayer(Direction.NORTHEAST)
            Command.MOVE_NORTHWEST -> gameState.movePlayer(Direction.NORTHWEST)
            Command.REST -> {
                gameState.player.lastMove = null
                gameState.player.sneaky = true
            }
            Command.DEBUG -> {
                gameState.descend()
            }
        }
        gameState.updateFov()
        Gdx.graphics.requestRendering()
    }

    private fun pixelToPos(x: Int, y: Int): Pos {
        val r = Rectangular(x / HALF_TILE_WIDTH, (y - FULL_TILE_HEIGHT + PART_TILE_HEIGHT) / PART_TILE_HEIGHT)
        return sprites.rectangularToPos(r)
//        val floatPos = FloatPos(x.toFloat() / (2 * ), y.toFloat() / PART_TILE_HEIGHT)
    }

    fun render(batch: Batch) {
//        renderTerrain(batch)
        renderSprites(batch)
//        renderPlayerTail(batch)
//        bottomText = "Skealkh"
//        bottomText?.forEachIndexed { i, char ->
//            charToTexture(char)?.run {
//                batch.draw(this, HALF_TILE_WIDTH * i + 10f, 0f)
//            }
//        }
    }

    fun moveMouse(x: Int, y: Int) {
        val pos = pixelToPos(x, y)
        val newMouseLocation = if (sprites.inBounds(pos)) {
            pos
        } else {
            null
        }
        if (newMouseLocation != mouseLocation) {
            mouseLocation = newMouseLocation
            Gdx.graphics.requestRendering()
        }
    }

    private fun renderSprites(batch: Batch) {
        sprites.forEach { sprite, i ->
            val tile = gameState.level.tiles[i]
            val tileView = gameState.fov[i]
            val terrRegion = terrainRegion(tileView.terrain)
            if (tileView.lastSeen == gameState.turn) {
                val mob = tile.mob
                val mRegion = mobRegion(mob)
                val item = tile.item
                when {
                    mRegion != null -> {
                        sprite.setRegion(mRegion)
                        sprite.setFlip(mob!!.facingRight, false)
                        sprite.setColor(1f, 1f, 1f, 1f)
                        sprite.draw(batch)
                    }
                    item != null -> {
                        sprite.setRegion(itemRegion(item))
                        sprite.setColor(1f, 1f, 1f, 1f)
                        sprite.draw(batch)
                    }
                    else -> {
                        sprite.setRegion(terrRegion)
                        sprite.color = terrainColor(tileView.terrain)
                        sprite.draw(batch)
                    }
                }
            } else if (tileView.lastSeen > gameState.firstTurn) {
                val item = tileView.item
                if (item != null) {
                    sprite.setRegion(itemRegion(item))
                    sprite.setColor(0.5f, 0.5f, 0.5f, 1f)
                    sprite.draw(batch)
                } else {
                    sprite.setRegion(terrRegion)
                    sprite.color = terrainColor(tileView.terrain).mul(0.5f, 0.5f, 0.5f, 1.0f)
                    sprite.draw(batch)
                }
            }
        }
        val mouseLocation = mouseLocation
        if (mouseLocation != null) {
            sprites[mouseLocation].run {
                color = Color(1f, 1f, 0f, 1f)
                draw(batch)
            }
        }
    }

    private fun mobRegion(mob: Mob?): TextureRegion? {
        return when (mob) {
            is Player -> player
            is Hive -> hive
            is Acolyte -> acolyte
            else -> null
        }
    }

    private fun terrainRegion(terrain: Terrain): TextureRegion {
        return when (terrain) {
            Terrain.WALL -> wall
            Terrain.FLOOR -> floor
            Terrain.DEEP_WATER, Terrain.SHALLOW_WATER -> water
            Terrain.SHORT_GRASS -> shortGrass
            Terrain.TALL_GRASS -> tallGrass
            Terrain.CLOSED_DOOR -> closedDoor
            Terrain.OPEN_DOOR -> openDoor
            Terrain.EXIT -> exit
            Terrain.EXIT_LOCKED -> exitLocked
        }
    }

    private fun terrainColor(terrain: Terrain): Color {
        return when (terrain) {
            Terrain.WALL -> rgb(179, 174, 162)
            Terrain.FLOOR -> rgb(128, 128, 128)
            Terrain.EXIT, Terrain.EXIT_LOCKED -> rgb(255, 255, 255)
            Terrain.CLOSED_DOOR, Terrain.OPEN_DOOR -> rgb(128, 0, 0)
            Terrain.SHORT_GRASS, Terrain.TALL_GRASS -> rgb(20, 180, 20)
            Terrain.DEEP_WATER, Terrain.SHALLOW_WATER -> rgb(20, 80, 255)
        }
    }

    private  fun itemRegion(item: Item): TextureRegion {
        return when (item) {
            Item.KEY -> key
            Item.GOLD -> gold
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

private fun rgb(r: Int, g: Int, b: Int): Color {
    return Color(r / 256f, g / 256f, b / 256f, 1f)
}
