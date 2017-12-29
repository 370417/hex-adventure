package com.albertford

import com.albertford.mob.Player
import com.badlogic.gdx.Gdx
import java.util.*

class GameState(width: Int, height: Int) {

    var firstTurn = 0
    var turn = 0
    val actors = ArrayList<Actor>()
    val delayedActors = ArrayList<Any>()
    val player = Player()
    val level = Level(width, height)
    val fov = Grid(width, height) { TileView(-1, Terrain.WALL, null) }
    private val rand = Random()

    init {
        player.pos = level.tiles.linearToPos(width * height / 2)
        descend()
    }

    fun updateFov() {
        turn++
        Grid.shadowcast(player.pos, this::semiTransparent, this::semiReveal)
        Grid.shadowcast(player.pos, this::transparent, this::reveal)
    }

    fun movePlayer(direction: Direction) {
        val wasStill = player.lastMove == null
        if (!player.move(level, direction)) {
            level.bump(player, direction)
            if (level.tiles[player.pos + direction].terrain == Terrain.EXIT) {
                player.facingRight = !player.facingRight
                descend()
            } else if (level.tiles[player.pos + direction].terrain == Terrain.EXIT_LOCKED && player.hasKey) {
                level.tiles[player.pos + direction].terrain = Terrain.EXIT
            }
        } else {
            if (level.tiles[player.pos].item == Item.KEY) {
                level.tiles[player.pos].item = null
                player.hasKey = true
            }
            if (!wasStill) {
                player.sneaky = false
            }
        }
    }

    fun descend() {
        player.hasKey = false
        val seed = rand.nextLong()
        player.pos = level.init(seed, player.pos)
        Gdx.app.log("SEED", "$seed")
        actors.clear()
        level.tiles.forEach { tile, _ ->
            val mob = tile.mob
            if (mob != null && mob is Actor) {
                actors.add(mob)
            }
        }
        level.tiles[player.pos].mob = player
        turn++
        firstTurn = turn
        updateFov()
    }

    private fun transparent(pos: Pos): Boolean {
        return level.tiles[pos].terrain.transparent
    }

    private fun semiTransparent(pos: Pos): Boolean {
        val terrain = level.tiles[pos].terrain
        return terrain.transparent || terrain == Terrain.TALL_GRASS
    }

    private fun reveal(pos: Pos) {
        fov[pos].run {
            lastSeen = turn
            terrain = level.tiles[pos].terrain
            item = level.tiles[pos].item
        }
    }

    private fun semiReveal(pos: Pos) {
        fov[pos].run {
            lastSeen = turn - 1
            terrain = level.tiles[pos].terrain
            item = level.tiles[pos].item
        }
    }
}
