package com.albertford

class GameState(width: Int, height: Int) {

    var turn = 0
    val actors = ArrayList<Any>()
    val delayedActors = ArrayList<Any>()
    val player = Player(Pos(0, 0))
    var level = Level(width, height)
    val fov = Grid(width, height) { TileView(-1, Terrain.WALL) }

    init {
        player.pos = level.tiles.linearToPos(width * height / 2)
        level.init(0, player.pos)
        level.tiles[player.pos].mob = player

        beginTurn()
    }

    fun beginTurn() {
        updateFov()
    }

    fun endTurn() {
        turn++
    }

    fun updateFov() {
        turn++
        Grid.shadowcast(player.pos, this::transparent, this::reveal)
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
