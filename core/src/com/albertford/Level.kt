package com.albertford

import com.badlogic.gdx.utils.IntSet
import java.util.*

private const val MIN_LAKE_SIZE = 9

class Level(width: Int, height: Int) {

    val tiles = Grid(width, height) { Tile(Terrain.WALL) }

    fun bump(mob: Mob, direction: Direction) {
        val targetTile = tiles[mob.pos + direction]
        if (targetTile.terrain == Terrain.CLOSED_DOOR) {
            targetTile.terrain = Terrain.OPEN_DOOR
        }
    }

    fun init(seed: Long, start: Pos): Pos {
        val rand = Random(seed)
        resetTerrain(start)
        val innerIndices = shuffledInnerIndices(rand)
        carveCaves(innerIndices, tiles)
        removeSmallWalls(tiles)
        val size = removeOtherCaves(start)
        if (size < tiles.width * tiles.height / 3) {
            return init(rand.nextLong(), start)
        }
        fillSmallCaves(start)
        val newStart = adjustStart(start)
//        addDoors(innerIndices)

        val lakeTilesArray = Array(1) { Grid(tiles.width, tiles.height) { Tile(Terrain.WALL) } }
        for (lakeTiles in lakeTilesArray) {
            carveCaves(shuffledInnerIndices(rand), lakeTiles)
            removeSmallWalls(lakeTiles)
            addLakes(start, innerIndices, lakeTiles)
        }
        addExit(innerIndices, newStart)
        addGrass(innerIndices, rand)
        return newStart
    }

    /* Turn everything to wall except starting position */
    private fun resetTerrain(start: Pos) {
        tiles.forEach { tile, _ ->
            tile.terrain = Terrain.WALL
            tile.mob = null
            tile.item = null
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

    private fun removeOtherCaves(start: Pos): Int {
        val visitedTiles = Grid(tiles.width, tiles.height) { false }
        var mainCaveSize = 0
        tiles.floodfill(start, { pos ->
            !visitedTiles[pos] && tiles[pos].terrain == Terrain.FLOOR
        }, { pos ->
            visitedTiles[pos] = true
            mainCaveSize++
        })
        visitedTiles.forEach { visited, i ->
            if (!visited) {
                tiles[i].terrain = Terrain.WALL
            }
        }
        return mainCaveSize
    }

    @Suppress("NAME_SHADOWING")
    private fun fillSmallCaves(start: Pos) {
        tiles.forEach { tile, i ->
            val pos = tiles.linearToPos(i)
            fillDeadEnd(start, pos)
            val caveSet = IntSet(4)
            tiles.floodfill(pos, { pos ->
                val i1 = tiles.posToLinear(pos)
                !caveSet.contains(i1) && isCave(pos) && caveSet.size < 4
            }, { pos ->
                val i1 = tiles.posToLinear(pos)
                caveSet.add(i1)
            })
            if (caveSet.size in 2..3) {
                tile.terrain = Terrain.WALL
                val iterator = caveSet.iterator()
                while (iterator.hasNext) {
                    val i1 = iterator.next()
                    fillDeadEnd(start, tiles.linearToPos(i1))
                }
            }
        }
    }

    private fun adjustStart(start: Pos): Pos {
        if (tiles[start].terrain == Terrain.WALL) {
            var bestIndex = 0
            var bestDistance = Int.MAX_VALUE
            tiles.forEach { tile, i ->
                if (tile.terrain.passable) {
                    val pos = tiles.linearToPos(i)
                    val distance = start.distance(pos)
                    if (distance < bestDistance) {
                        bestIndex = i
                        bestDistance = distance
                    }
                }
            }
            return tiles.linearToPos(bestIndex)
        } else {
            return start
        }
    }

    private fun countFloorGroups(pos: Pos): Int {
        var groups = 0
        var curr = pos
        Direction.forEach { direction ->
            curr = pos + direction
            val next = pos + direction.rotate(1)
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

    private fun fillDeadEnd(start: Pos, pos: Pos) {
        if (!isDeadEnd(pos)) {
            return
        }
        tiles[pos].terrain = Terrain.WALL
        pos.forEachNeighbor {
            fillDeadEnd(start, it)
        }
    }

    private fun isDeadEnd(pos: Pos): Boolean {
        if (tiles[pos].terrain == Terrain.FLOOR && countFloorGroups(pos) == 1) {
            for (dir in Direction.normals) {
                if (isCave(pos + dir)) {
                    return false
                }
            }
            return true
        }
        return false
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
                        var netFloorDirection = Displacement(0, 0)
                        Direction.forEach { direction ->
                            if (tiles[pos + direction].terrain == Terrain.FLOOR) {
                                netFloorDirection += direction
                            }
                        }
                        if (netFloorDirection == Displacement(0, 0) && notNearDoor(pos)) {
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
        pos.forEachNeighbor {
            if (tiles[it].terrain == terrain) {
                floors++
            }
        }
        return floors
    }

    private fun notNearDoor(pos: Pos): Boolean {
        return countTerrainNeighbors(pos, Terrain.CLOSED_DOOR) == 0
    }

    private fun addExit(innerIndices: IntArray, start: Pos) {
        for (i in innerIndices) {
            val pos = tiles.linearToPos(i)
            if (tiles[i].terrain == Terrain.WALL &&
                    countTerrainNeighbors(pos, Terrain.WALL) == 4 &&
                    countFloorGroups(pos) == 1) {
                tiles[i].terrain = Terrain.EXIT_LOCKED
                break
            }
        }
        val startIndex = tiles.posToLinear(start)
        for (i in innerIndices) {
            if (tiles[i].terrain.passable && tiles[i].item == null && i != startIndex) {
                tiles[i].item = Item.KEY
                break
            }
        }
    }

    /** Add lakes based on the caves of another level */
    private fun addLakes(start: Pos, innerIndices: IntArray, lakeTiles: Grid<Tile>) {
        val (lakes, lakeCount) = calcLakes(innerIndices, lakeTiles)
        // 0 if unreachable from start
        // x where x is a lake index if reachable from start without going through that lake
        // for performance, we reuse the same grid for each lake, and just override values
        val reachable = Grid(tiles.width, tiles.height) { 0 }
        for (lakeIndex in 1..lakeCount) {
            tiles.floodfill(start, { pos ->
                tiles[pos].terrain.passable && lakes[pos] != lakeIndex && reachable[pos] != lakeIndex
            }, { pos ->
                reachable[pos] = lakeIndex
            })
            var lakeSplitsLevel = false
            tiles.forEach { tile, i ->
                if (tile.terrain.passable && reachable[i] != lakeIndex && lakes[i] != lakeIndex) {
                    lakeSplitsLevel = true
                }
            }
            if (!lakeSplitsLevel) {
                tiles.forEach { tile, i ->
                    if (lakes[i] == lakeIndex) {
                        tile.terrain = Terrain.DEEP_WATER
                    }
                }
            }
        }
    }

    private fun calcLakes(innerIndices: IntArray, lakeTiles: Grid<Tile>): Pair<Grid<Int>, Int> {
        // 0 means no lake. A positive number corresponds to a certain lake
        val lakes = Grid(tiles.width, tiles.height) { 0 }
        var lakeCount = 0
        // we iterate in random order to prevent possibly favoring lakes in one corner of the map
        for (i in innerIndices) {
            val pos = tiles.linearToPos(i)
            if (lakes[i] == 0 && isCave(pos, lakeTiles)) {
                lakeCount++
                val lakePositions = HashSet<Pos>()
                lakeTiles.floodfill(pos, {
                    lakes[it] == 0 && isCave(it, lakeTiles)
                }, {
                    lakes[it] = lakeCount
                    lakePositions.add(it)
                })
                if (lakePositions.size < MIN_LAKE_SIZE) {
                    lakePositions.forEach {
                        lakes[it] = 0
                    }
                    lakeCount--
                }
            }
        }
        return Pair(lakes, lakeCount)
    }

    private class GrassSeed(val seeds: Int, val pos: Pos)

    private fun addGrass(innerIndices: IntArray, rand: Random) {
        val growGrass = PriorityQueue<GrassSeed>(kotlin.Comparator { o1, o2 ->
            o2.seeds - o1.seeds
        })
        var grasses = 5 + rand.nextInt(5)
        for (i in innerIndices) {
            val pos = tiles.linearToPos(i)
            if (isCave(pos)) {
                growGrass.add(GrassSeed(10, pos))
                grasses--
                if (grasses == 0) {
                    break
                }
            }
        }
        while (growGrass.isNotEmpty()) {
            val grassSeed = growGrass.poll()
            grassSeed.pos.forEachNeighbor { neighbor ->
                if (tiles[neighbor].terrain == Terrain.FLOOR) {
                    val seeds = grassSeed.seeds / 2 + rand.nextInt(1 + grassSeed.seeds / 2) - 1
                    if (seeds > 0) {
                        growGrass.add(GrassSeed(seeds, neighbor))
                    }
                    tiles[grassSeed.pos].terrain = if (grassSeed.seeds > 5) {
                        Terrain.TALL_GRASS
                    } else {
                        Terrain.SHORT_GRASS
                    }
                }
            }
        }
    }

    private fun addItems(innerIndices: IntArray, start: Pos, rand: Random) {
        val startIndex = tiles.posToLinear(start)
        for (i in innerIndices) {
            if (tiles[i].terrain.passable && tiles[i].item == null && i != startIndex) {
                if (rand.nextInt(100) == 0) {
                    tiles[i].item = Item.GOLD
                }
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

private fun carveCaves(innerIndices: IntArray, tiles: Grid<Tile>) {
    for (i in innerIndices) {
        if (tiles[i].terrain == Terrain.WALL && countFloorGroups(tiles.linearToPos(i), tiles) != 1) {
            tiles[i].terrain = Terrain.FLOOR
        }
    }
}

private fun countFloorGroups(pos: Pos, tiles: Grid<Tile>): Int {
    var groups = 0
    var curr = pos
    Direction.forEach { direction ->
        curr = pos + direction
        val next = pos + direction.rotate(1)
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

/** Remove groups of less than 6 walls */
@Suppress("NAME_SHADOWING")
private fun removeSmallWalls(tiles: Grid<Tile>) {
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
        val pos = tiles.linearToPos(i)
        var groupSize = 0
        tiles.floodfill(pos, { pos ->
            tiles[pos].terrain == Terrain.WALL && groupIndex[pos] == -1
        }, { pos ->
            groupIndex[pos] = i
            groupSize++
        })
        if (groupSize in 1..5) {
            tile.terrain = Terrain.FLOOR
            smallGroups.add(i)
        }
    }
}

private fun isCave(pos: Pos, tiles: Grid<Tile>): Boolean {
    return tiles[pos].terrain == Terrain.FLOOR && countFloorGroups(pos, tiles) == 1
}
