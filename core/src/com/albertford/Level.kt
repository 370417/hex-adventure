package com.albertford

import com.badlogic.gdx.utils.IntSet
import java.util.*

class Level(width: Int, height: Int) {

    val tiles = Grid(width, height) { Tile(Terrain.WALL) }
    var ambushFactors: Grid<Float>? = null

    fun moveMob(mob: Mob, direction: Axial): Boolean {
        val targetTile = tiles[mob.axial + direction]
        if (!targetTile.terrain.passable || targetTile.mob != null) {
            return false
        }
        tiles[mob.axial].mob = null
        mob.axial.plusAssign(direction)
        tiles[mob.axial].mob = mob
        return true
    }

    fun bump(mob: Mob, direction: Axial) {
        val targetTile = tiles[mob.axial + direction]
        if (targetTile.terrain == Terrain.CLOSED_DOOR) {
            targetTile.terrain = Terrain.OPEN_DOOR
        }
    }

    fun init(seed: Long, start: Axial) {
        val rand = Random(seed)
        resetTerrain(start)
        val innerIndices = shuffledInnerIndeces(rand)
        carveCaves(innerIndices)
        removeSmallWalls()
        val size = removeOtherCaves(start)
        if (size < tiles.width * tiles.height / 4) {
            init(rand.nextLong(), start)
            return
        }
        fillSmallCaves(start)
        val fovSizes = Grid(tiles.width, tiles.height) { i ->
            var fovSize = 0
            if (tiles[i].terrain.passable) {
                Grid.shadowcast(tiles.linearToAxial(i), { axial ->
                    tiles[axial].terrain.transparent
                }, { axial ->
                    if (tiles[axial].terrain.transparent) {
                        fovSize++
                    }
                })
            }
            fovSize
        }
        ambushFactors = Grid(tiles.width, tiles.height) { i ->
            if (fovSizes[i] > 0) {
                val axial = tiles.linearToAxial(i)
                Grid.directions.map { direction ->
                    fovSizes[axial + direction].toFloat() / fovSizes[i]
                }.max() ?: 0f
            } else {
                0f
            }
        }
        // doors
        for (i in innerIndices) {
            if (tiles[i].terrain == Terrain.FLOOR && countFloorGroups(i) > 1 && countFloorNeighbors(i) > 2) {
                tiles[i].terrain = Terrain.CLOSED_DOOR
            }
        }
    }

    /* Turn everything to wall except starting position */
    private fun resetTerrain(start: Axial) {
        tiles.forEach { _, i ->
            tiles[i].terrain = Terrain.WALL
        }
        tiles[start].terrain = Terrain.FLOOR
    }

    private fun shuffledInnerIndeces(rand: Random): IntArray {
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
            val (x, y) = tiles.linearToAxial(i)
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

    private fun removeOtherCaves(start: Axial): Int {
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

    private fun fillSmallCaves(start: Axial) {
        tiles.forEach { tile, i ->
            val (x, y) = tiles.linearToAxial(i)
            fillDeadEnd(start, x, y)
            val caveSet = IntSet(4)
            tiles.floodfill(x, y, { x1, y1 ->
                val i1 = tiles.axialToLinear(x1, y1)
                !caveSet.contains(i1) && isCave(Axial(x1, y1)) && caveSet.size < 4
            }, { x1, y1 ->
                val i1 = tiles.axialToLinear(x1, y1)
                caveSet.add(i1)
            })
            if (caveSet.size in 2..3) {
                tile.terrain = Terrain.WALL
                val iterator = caveSet.iterator()
                while (iterator.hasNext) {
                    val i1 = iterator.next()
                    val (x1, y1) = tiles.linearToAxial(i1)
                    fillDeadEnd(start, x1, y1)
                }
            }
        }
    }

    private fun countFloorGroups(axial: Axial): Int {
        var groups = 0
        var curr = axial
        for (j in 0 until 6) {
            curr = axial + Grid.directions[j]
            val next = axial + Grid.directions[(j + 1) % 6]
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
        return countFloorGroups(tiles.linearToAxial(i))
    }

    private fun countFloorNeighbors(axial: Axial): Int {
        var floors = 0
        for (direction in Grid.directions) {
            if (tiles[axial + direction].terrain == Terrain.FLOOR) {
                floors++
            }
        }
        return floors
    }

    private fun countFloorNeighbors(i: Int): Int {
        return countFloorNeighbors(tiles.linearToAxial(i))
    }

    private fun fillDeadEnd(start: Axial, x: Int, y: Int) {
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

    private fun isDeadEnd(axial: Axial): Boolean {
        if (tiles[axial].terrain == Terrain.FLOOR && countFloorGroups(axial) == 1) {
            for (dir in Grid.directions) {
                if (isCave(axial + dir)) {
                    return false
                }
            }
            return true
        }
        return false
    }

    private fun isDeadEnd(x: Int, y: Int): Boolean {
        return isDeadEnd(Axial(x, y))
    }

    private fun isCave(axial: Axial): Boolean {
        return tiles[axial].terrain == Terrain.FLOOR && countFloorGroups(axial) == 1
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
