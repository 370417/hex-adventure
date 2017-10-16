package com.albertford

import java.util.*

class Level {

    val tiles = Grid(48, 31) { Tile(Terrain.WALL) }

    fun init(seed: Long, start: Axial) {
        val rand = Random(seed)
        resetTerrain(start)
        carveCaves(rand)
    }

    /* Turn everything to wall except starting position */
    private fun resetTerrain(start: Axial) {
        tiles.forEach { _, i ->
            tiles.get(i).terrain = Terrain.WALL
        }
        tiles.get(start).terrain = Terrain.FLOOR
    }

    private fun carveCaves(rand: Random) {
        val width = tiles.width
        val height = tiles.height
        val innerIndices = IntArray((width - 2) * (height - 2)) { i ->
            val x = i % (width - 2)
            val y = i / (width - 2)
            (y + 1) * width + (x + 1)
        }
        shuffle(innerIndices, rand)
        for (i in innerIndices) {
            if (tiles.get(i).terrain == Terrain.WALL && countFloorGroups(i) != 1) {
                tiles.get(i).terrain = Terrain.FLOOR
            }
        }
    }

    private fun countFloorGroups(i: Int): Int {
        val axial = tiles.linearToAxial(i)
        var groups = 0
        var curr = axial
        for (j in 0 until 6) {
            curr = axial.sum(Grid.directions[j])
            val next = axial.sum(Grid.directions[(j + 1) % 6])
            if (tiles.get(curr).terrain == Terrain.FLOOR && tiles.get(next).terrain != Terrain.FLOOR) {
                groups++
            }
        }
        return when {
            groups > 0 -> groups
            tiles.get(curr).terrain == Terrain.FLOOR -> 1
            else -> 0
        }
    }
}

private fun shuffle(arr: IntArray, rand: Random) {
    for (i in arr.size - 1 downTo 1) {
        val j = rand.nextInt(i + 1)
        val temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
}
