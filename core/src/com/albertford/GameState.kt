package com.albertford

class GameState(width: Int, height: Int) {

    var turn = 0
    val actors = ArrayList<Any>()
    val delayedActors = ArrayList<Any>()
    val player = Player(Axial(0, 0))
    var level = Level(width, height)
    val fov = Grid(width, height) { TileView(-1, Terrain.WALL) }

    init {
        player.axial = level.tiles.linearToAxial(width * height / 2)
        level.init(0, player.axial)
        level.tiles[player.axial].mob = player

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
        Grid.shadowcast(player.axial, this::transparent, this::reveal)
    }

    private fun transparent(axial: Axial): Boolean {
        return level.tiles[axial].terrain.transparent
    }

    private fun reveal(axial: Axial) {
        val tileView = fov[axial]
        tileView.lastSeen = turn
        tileView.terrain = level.tiles[axial].terrain
    }
}
