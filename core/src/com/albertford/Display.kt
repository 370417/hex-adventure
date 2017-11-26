package com.albertford

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.Sprite
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.graphics.g2d.TextureRegion

class Display(private var gameState: GameState, atlas: TextureAtlas, font: Texture) {

    private val wall = atlas.findRegion("wall")
    private val shortGrass = atlas.findRegion("shortGrass")
    private val tallGrass = atlas.findRegion("tallGrass")
    private val closedDoor = atlas.findRegion("closedDoor")
    private val openDoor = atlas.findRegion("openDoor")
    private val exit = atlas.findRegion("exit")
    private val exitLocked = atlas.findRegion("exitLocked")

    private val letters = TextureRegion.split(font, 9, 16)

    private val player = atlas.findRegion("skunk")
    private val sneakyPlayer = atlas.findRegion("skunkSneak")
    private val sneakyPlayerTail = atlas.findRegion("tailTip")

    private val key = atlas.findRegion("key")
    private val gold = atlas.findRegion("gold")

    private val sprites = Grid(gameState.level.tiles.width, gameState.level.tiles.height) { i ->
        val (x, y) = gameState.level.tiles.linearToRectangular(i)
        val sprite = Sprite(wall)
        sprite.x = (9 * x).toFloat()
        sprite.y = (16 * y).toFloat()
        sprite
    }

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

    fun render(batch: Batch) {
        renderTerrain(batch)
        renderSprites(batch)
        renderPlayerTail(batch)
//        bottomText = "Skealkh"
//        bottomText?.forEachIndexed { i, char ->
//            val texture = charToTexture(char)
//            if (texture != null) {
//                batch.draw(charToTexture(char), 9f * i + 10f, 0f)
//            }
//        }
    }

    private fun renderTerrain(batch: Batch) {
        sprites.forEach { sprite, i ->
            val tileView = gameState.fov[i]
            val terrain = tileView.terrain
            sprite.setRegion(wall)
            if (tileView.lastSeen > gameState.firstTurn) {
                sprite.color = terrainBgColor(terrain, tileView.lastSeen != gameState.turn)
                sprite.draw(batch)
            }
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
                    terrRegion != null -> {
                        sprite.setRegion(terrRegion)
                        sprite.color = terrainFgColor(tileView.terrain)
                        sprite.draw(batch)
                    }
                }
            } else if (tileView.lastSeen > gameState.firstTurn) {
                val item = tileView.item
                if (item != null) {
                    sprite.setRegion(itemRegion(item))
                    sprite.setColor(1f, 1f, 1f, 1f)
                    sprite.draw(batch)
                } else if (terrRegion != null) {
                    sprite.setRegion(terrRegion)
                    sprite.color = terrainFgColor(tileView.terrain)
                    sprite.draw(batch)
                }
            }
        }
    }

    private fun renderPlayerTail(batch: Batch) {
        if (gameState.player.sneaky) {
            val tailSprite = if (gameState.player.facingRight) {
                sprites[gameState.player.pos + Direction.WEST]
            } else {
                sprites[gameState.player.pos + Direction.EAST]
            }
            tailSprite.setRegion(sneakyPlayerTail)
            tailSprite.flip(gameState.player.facingRight, false)
            tailSprite.setColor(1f, 1f, 1f, 1f)
            tailSprite.draw(batch)
        }
    }

    private fun mobRegion(mob: Mob?): TextureRegion? {
        return when (mob) {
            is Player -> if (mob.sneaky) {
                sneakyPlayer
            } else {
                player
            }
            else -> null
        }
    }

    private fun terrainRegion(terrain: Terrain): TextureRegion? {
        return when (terrain) {
            Terrain.WALL, Terrain.FLOOR, Terrain.DEEP_WATER, Terrain.SHALLOW_WATER -> null
            Terrain.SHORT_GRASS -> shortGrass
            Terrain.TALL_GRASS -> tallGrass
            Terrain.CLOSED_DOOR -> closedDoor
            Terrain.OPEN_DOOR -> openDoor
            Terrain.EXIT -> exit
            Terrain.EXIT_LOCKED -> exitLocked
        }
    }

    private fun terrainBgColor(terrain: Terrain, remembered: Boolean): Color {
        return if (remembered) when (terrain) {
            Terrain.WALL -> Color(100 / 256f, 100 / 256f, 100 / 256f, 1f)
            Terrain.EXIT -> Color(0f, 0f, 0f, 1f)
            Terrain.EXIT_LOCKED -> Color(0f, 0f, 0f, 1f)
            Terrain.CLOSED_DOOR -> Color(0.25f, 0f, 0f, 1f)
            Terrain.OPEN_DOOR -> Color(0f, 0f, 0f, 1f)
            Terrain.FLOOR -> Color(40 / 256f, 40 / 256f, 40 / 256f, 1f)
            Terrain.TALL_GRASS -> Color(0f, 0f, 0f, 1f)
            Terrain.SHORT_GRASS -> Color(0f, 0f, 0f, 1f)
            Terrain.DEEP_WATER -> Color(0f, 0f, 1f, 1f)
            Terrain.SHALLOW_WATER -> Color(0f, 0f, 1f, 1f)
        } else when (terrain) {
            Terrain.WALL -> Color(179 / 256f, 174 / 256f, 162 / 256f, 1f)
            Terrain.EXIT -> Color(0f, 0f, 0f, 1f)
            Terrain.EXIT_LOCKED -> Color(0f, 0f, 0f, 1f)
            Terrain.CLOSED_DOOR -> Color(0.5f, 0f, 0f, 1f)
            Terrain.OPEN_DOOR -> Color(0f, 0f, 0f, 1f)
            Terrain.FLOOR -> Color(70 / 256f, 66 / 256f, 57 / 256f, 1f)
            Terrain.TALL_GRASS -> Color(0f, 0f, 0f, 1f)
            Terrain.SHORT_GRASS -> Color(0f, 0f, 0f, 1f)
            Terrain.DEEP_WATER -> Color(0f, 0f, 1f, 1f)
            Terrain.SHALLOW_WATER -> Color(0f, 0f, 1f, 1f)
        }
    }

    private fun terrainFgColor(terrain: Terrain): Color {
        return Color(1f, 1f, 1f, 1f)
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
