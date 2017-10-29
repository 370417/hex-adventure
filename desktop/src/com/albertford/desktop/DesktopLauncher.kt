package com.albertford.desktop

import com.albertford.Game
import com.badlogic.gdx.backends.lwjgl.LwjglApplication
import com.badlogic.gdx.backends.lwjgl.LwjglApplicationConfiguration

object DesktopLauncher {
    @JvmStatic
    fun main(arg: Array<String>) {
        val width = 42
        val height = 31
        val config = LwjglApplicationConfiguration()
        config.title = "Skealkh"
        config.resizable = false
        config.width = 18 * width + 9
        config.height = 16 * height + 8
        LwjglApplication(Game(width, height), config)
    }
}
