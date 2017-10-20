package com.albertford

import com.badlogic.gdx.Gdx
import java.util.*

class GameState(width: Int, height: Int) {

    var firstTurn = 0
    var turn = 0
    val actors = ArrayList<Any>()
    val delayedActors = ArrayList<Any>()
    val player = Player()
    val level = Level(width, height)
    val fov = Grid(width, height) { TileView(-1, Terrain.WALL) }
    val rand = Random()

    init {
        player.pos = level.tiles.linearToPos(width * height / 2)
        descend()
    }

    fun updateFov() {
        turn++
        Grid.shadowcast(player.pos, this::transparent, this::reveal)
    }

    fun movePlayer(direction: Pos) {
        if (!level.moveMob(player, direction)) {
            level.bump(player, direction)
            if (level.tiles[player.pos + direction].terrain == Terrain.EXIT) {
                player.facingRight = !player.facingRight
                descend()
            } else if (level.tiles[player.pos + direction].terrain == Terrain.EXIT_LOCKED && player.hasKey) {
                level.tiles[player.pos + direction].terrain = Terrain.EXIT
                player.hasKey = false
            }
        } else if (level.tiles[player.pos].item == Item.KEY) {
            level.tiles[player.pos].item = null
            player.hasKey = true
        }
    }

    private fun descend() {
        level.init(rand.nextLong(), player.pos)
        level.tiles[player.pos].mob = player
        firstTurn = turn
        updateFov()
    }

    private fun transparent(pos: Pos): Boolean {
        return level.tiles[pos].terrain.transparent
    }

    private fun reveal(pos: Pos) {
        val tileView = fov[pos]
        tileView.lastSeen = turn
        tileView.terrain = level.tiles[pos].terrain
    }
}
