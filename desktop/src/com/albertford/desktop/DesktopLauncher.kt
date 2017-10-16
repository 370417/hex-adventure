package com.albertford.desktop

import com.albertford.Game
import com.badlogic.gdx.backends.lwjgl.LwjglApplication
import com.badlogic.gdx.backends.lwjgl.LwjglApplicationConfiguration

object DesktopLauncher {
    @JvmStatic
    fun main(arg: Array<String>) {
        val config = LwjglApplicationConfiguration()
        config.title = "Hex Adventure"
        config.resizable = false
        config.width = 18 * 48 + 9
        config.height = 16 * 31 + 9
        LwjglApplication(Game(), config)
    }
}
