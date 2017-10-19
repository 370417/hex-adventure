package com.albertford

import com.badlogic.gdx.utils.IntSet
import java.util.*

class Level(width: Int, height: Int) {

    val tiles = Grid(width, height) { Tile(Terrain.WALL) }

    fun moveMob(mob: Mob, direction: Pos): Boolean {
        val targetTile = tiles[mob.pos + direction]
        if (!targetTile.terrain.passable || targetTile.mob != null) {
            return false
        }
        tiles[mob.pos].mob = null
        mob.pos.plusAssign(direction)
        tiles[mob.pos].mob = mob
        return true
    }

    fun bump(mob: Mob, direction: Pos) {
        val targetTile = tiles[mob.pos + direction]
        if (targetTile.terrain == Terrain.CLOSED_DOOR) {
            targetTile.terrain = Terrain.OPEN_DOOR
        }
    }

    fun init(seed: Long, start: Pos) {
        val rand = Random(/*seed*/)
        resetTerrain(start)
        val innerIndices = shuffledInnerIndices(rand)
        carveCaves(innerIndices)
        removeSmallWalls()
        val size = removeOtherCaves(start)
        if (size < tiles.width * tiles.height / 4) {
            init(rand.nextLong(), start)
            return
        }
        fillSmallCaves(start)
        addDoors(innerIndices)
//        val fovSizes = generateVisibility()
//        growGrass(fovSizes)
    }

    /* Turn everything to wall except starting position */
    private fun resetTerrain(start: Pos) {
        tiles.forEach { _, i ->
            tiles[i].terrain = Terrain.WALL
        }
        tiles[start].terrain = Terrain.FLOOR
    }

    private fun shuffledInnerIndices(rand: Random): IntArray {
        val width = tiles.width
        val height = tiles.height
        val innerIndices = IntArray((width - 2) * (height - 2)) { i ->
            val x = i % (width - 2)
            val y = i / (width - 2)
            (y + 1) * width + (x + 1)
        }
        shuffle(innerIndices, rand)
        return innerIndices
    }

    private fun carveCaves(innerIndices: IntArray) {
        for (i in innerIndices) {
            if (tiles[i].terrain == Terrain.WALL && countFloorGroups(i) != 1) {
                tiles[i].terrain = Terrain.FLOOR
            }
        }
    }

    /** Remove groups of less than 6 walls */
    private fun removeSmallWalls() {
        // Each tile is either in a floor tile or in a group of wall tiles
        // Keeps track of the smallest index of the group of walls, or -1 for floor
        val groupIndex = Grid(tiles.width, tiles.height) { -1 }
        // A set of smallest group indices for groups smaller than 6 tiles
        val smallGroups = IntSet()
        tiles.forEach { tile, i ->
            if (tile.terrain == Terrain.FLOOR) {
                return@forEach
            }
            if (groupIndex[i] >= 0) {
                if (smallGroups.contains(groupIndex[i])) {
                    tile.terrain = Terrain.FLOOR
                }
                return@forEach
            }
            val (x, y) = tiles.linearToPos(i)
            var groupSize = 0
            tiles.floodfill(x, y, { x1, y1 ->
                tiles[x1, y1].terrain == Terrain.WALL && groupIndex[x1, y1] == -1
            }, { x1, y1 ->
                groupIndex[x1, y1] = i
                groupSize++
            })
            if (groupSize in 1..5) {
                tile.terrain = Terrain.FLOOR
                smallGroups.add(i)
            }
        }
    }

    private fun removeOtherCaves(start: Pos): Int {
        val visitedTiles = Grid(tiles.width, tiles.height) { false }
        var mainCaveSize = 0
        tiles.floodfill(start.x, start.y, { x, y ->
            !visitedTiles[x, y] && tiles[x, y].terrain == Terrain.FLOOR
        }, { x, y ->
            visitedTiles[x, y] = true
            mainCaveSize++
        })
        visitedTiles.forEach { visited, i ->
            if (!visited) {
                tiles[i].terrain = Terrain.WALL
            }
        }
        return mainCaveSize
    }

    private fun fillSmallCaves(start: Pos) {
        tiles.forEach { tile, i ->
            val (x, y) = tiles.linearToPos(i)
            fillDeadEnd(start, x, y)
            val caveSet = IntSet(4)
            tiles.floodfill(x, y, { x1, y1 ->
                val i1 = tiles.posToLinear(x1, y1)
                !caveSet.contains(i1) && isCave(Pos(x1, y1)) && caveSet.size < 4
            }, { x1, y1 ->
                val i1 = tiles.posToLinear(x1, y1)
                caveSet.add(i1)
            })
            if (caveSet.size in 2..3) {
                tile.terrain = Terrain.WALL
                val iterator = caveSet.iterator()
                while (iterator.hasNext) {
                    val i1 = iterator.next()
                    val (x1, y1) = tiles.linearToPos(i1)
                    fillDeadEnd(start, x1, y1)
                }
            }
        }
    }

    private fun countFloorGroups(pos: Pos): Int {
        var groups = 0
        var curr = pos
        for (j in 0 until 6) {
            curr = pos + Grid.directions[j]
            val next = pos + Grid.directions[(j + 1) % 6]
            if (tiles[curr].terrain == Terrain.FLOOR && tiles[next].terrain != Terrain.FLOOR) {
                groups++
            }
        }
        return when {
            groups > 0 -> groups
            tiles[curr].terrain == Terrain.FLOOR -> 1
            else -> 0
        }
    }

    private fun countFloorGroups(i: Int): Int {
        return countFloorGroups(tiles.linearToPos(i))
    }

    private fun fillDeadEnd(start: Pos, x: Int, y: Int) {
        if (!isDeadEnd(x, y)) {
            return
        }
        tiles[x, y].terrain = Terrain.WALL
        var relocateStart = start.x == x && start.y == y
        for ((dx, dy) in Grid.directions) {
            val newX = x + dx
            val newY = y + dy
            if (relocateStart && tiles[newX, newY].terrain == Terrain.FLOOR) {
                relocateStart = false
                start.x = newX
                start.y = newY
            }
            fillDeadEnd(start, newX, newY)
        }
    }

    private fun isDeadEnd(pos: Pos): Boolean {
        if (tiles[pos].terrain == Terrain.FLOOR && countFloorGroups(pos) == 1) {
            for (dir in Grid.directions) {
                if (isCave(pos + dir)) {
                    return false
                }
            }
            return true
        }
        return false
    }

    private fun isDeadEnd(x: Int, y: Int): Boolean {
        return isDeadEnd(Pos(x, y))
    }

    private fun isCave(pos: Pos): Boolean {
        return tiles[pos].terrain == Terrain.FLOOR && countFloorGroups(pos) == 1
    }

    private fun isTunnel(pos: Pos): Boolean {
        return tiles[pos].terrain == Terrain.FLOOR && countFloorGroups(pos) > 1
    }

    private fun addDoors(innerIndices: IntArray) {
        for (i in innerIndices) {
            val pos = tiles.linearToPos(i)
            if (isTunnel(pos)) {
                when (countTerrainNeighbors(pos, Terrain.FLOOR)) {
                    3 -> {
                        if (notNearDoor(pos)) {
                            tiles[i].terrain = Terrain.CLOSED_DOOR
                        }
                    }
                    4 -> {
                        val netFloorDirection = Pos(0, 0)
                        for (direction in Grid.directions) {
                            if (tiles[pos + direction].terrain == Terrain.FLOOR) {
                                netFloorDirection.plusAssign(direction)
                            }
                        }
                        if (netFloorDirection == Pos(0, 0) && notNearDoor(pos)) {
                            tiles[pos].terrain = Terrain.CLOSED_DOOR
                        } else if (notNearDoor(pos - netFloorDirection)) {
                            tiles[pos - netFloorDirection].terrain = Terrain.CLOSED_DOOR
                        }
                    }
                }
            }
        }
        innerIndices.forEachIndexed { arrayIndex, shuffledIndex ->
            if (arrayIndex % 3 != 0 && tiles[shuffledIndex].terrain == Terrain.CLOSED_DOOR) {
                tiles[shuffledIndex].terrain = Terrain.FLOOR
            }
        }
    }

    private fun countTerrainNeighbors(pos: Pos, terrain: Terrain): Int {
        var floors = 0
        for (direction in Grid.directions) {
            if (tiles[pos + direction].terrain == terrain) {
                floors++
            }
        }
        return floors
    }

    private fun notNearDoor(pos: Pos): Boolean {
        return countTerrainNeighbors(pos, Terrain.CLOSED_DOOR) == 0
    }

    private fun generateVisibility(): Grid<Int> {
        return Grid(tiles.width, tiles.height) { i ->
            var fovSize = 0
            if (tiles[i].terrain.passable) {
                Grid.shadowcast(tiles.linearToPos(i), { axial ->
                    tiles[axial].terrain.transparent
                }, { axial ->
                    if (tiles[axial].terrain.transparent) {
                        fovSize++
                    }
                })
            }
            fovSize
        }
    }

    private fun growGrass(fovSizes: Grid<Int>) {
        val shortGrassThreshold = 90
        fovSizes.forEach { fovSize, i ->
            if (fovSize > shortGrassThreshold) {
                tiles[i].terrain = Terrain.SHORT_GRASS
            }
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
