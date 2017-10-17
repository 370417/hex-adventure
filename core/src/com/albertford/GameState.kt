package com.albertford

class GameState(width: Int, height: Int) {

    val player = Mob(0, 0, MobType.PLAYER)
    var level = Level(width, height)
    val memory = Grid(width, height) { TileMemory(false, false, Terrain.WALL) }

    init {
        val start = level.tiles.linearToAxial(width * height / 2)
        level.init(0, start)
        player.x = start.x
        player.y = start.y
        level.tiles[start].mob = player

        memory.forEach { _, i ->
             memory[i].visible = false
        }
        Grid.shadowcast(start, { axial -> level.tiles[axial].terrain.transparent }, { axial ->
            val tileMemory = memory[axial]
            tileMemory.visible = true
            tileMemory.remembered = true
            tileMemory.terrain = level.tiles[axial].terrain
        })
    }

}