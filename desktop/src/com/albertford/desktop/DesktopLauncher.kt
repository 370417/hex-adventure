package com.albertford.desktop

import com.albertford.display.FULL_TILE_HEIGHT
import com.albertford.Game
import com.albertford.display.HALF_TILE_WIDTH
import com.albertford.display.PART_TILE_HEIGHT
import com.badlogic.gdx.backends.lwjgl.LwjglApplication
import com.badlogic.gdx.backends.lwjgl.LwjglApplicationConfiguration

const val SIDE_WIDTH = 25

object DesktopLauncher {
    @JvmStatic
    fun main(arg: Array<String>) {
        val width = 42
        val height = 31
        val config = LwjglApplicationConfiguration()
        config.title = "Hex Adventure"
        config.resizable = false
        config.width = HALF_TILE_WIDTH * (2 * width + 1 + SIDE_WIDTH)
        config.height = PART_TILE_HEIGHT * height + FULL_TILE_HEIGHT - PART_TILE_HEIGHT
        LwjglApplication(Game(width, height), config)
    }
}
