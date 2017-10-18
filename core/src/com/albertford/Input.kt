package com.albertford

import com.badlogic.gdx.Input.Keys
import com.badlogic.gdx.InputAdapter

class Input(private val display: Display) : InputAdapter() {

    val keyOptions = HashMap<Int, Command>()

    init {
        keyOptions[Keys.W] = Command.MOVE_NORTHWEST
        keyOptions[Keys.E] = Command.MOVE_NORTHEAST
        keyOptions[Keys.A] = Command.MOVE_WEST
        keyOptions[Keys.S] = Command.REST
        keyOptions[Keys.D] = Command.MOVE_EAST
        keyOptions[Keys.Z] = Command.MOVE_SOUTHWEST
        keyOptions[Keys.X] = Command.MOVE_SOUTHEAST
        keyOptions[Keys.SPACE] = Command.DEBUG
    }

    override fun keyDown(keycode: Int): Boolean {
        val command = keyOptions[keycode]
        if (command != null) {
            display.runCommand(command)
            return true
        } else {
            return false
        }
    }
}

enum class Command {
    MOVE_WEST, MOVE_EAST, MOVE_NORTHWEST, MOVE_NORTHEAST, MOVE_SOUTHWEST, MOVE_SOUTHEAST,
    REST,
    DEBUG
}
