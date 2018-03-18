package com.albertford.display

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

    override fun mouseMoved(screenX: Int, screenY: Int): Boolean {
        display.moveMouse(screenX, screenY)
        return true
    }

//    override fun touchDown(screenX: Int, screenY: Int, pointer: Int, button: Int): Boolean {
//        display.moveMouse()
//        return super.touchDown(screenX, screenY, pointer, button)
//    }
}

enum class Command {
    MOVE_WEST, MOVE_EAST, MOVE_NORTHWEST, MOVE_NORTHEAST, MOVE_SOUTHWEST, MOVE_SOUTHEAST,
    REST,
    DEBUG
}
