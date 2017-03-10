// Generates a new level

this.Level = {
    WIDTH: 48,
    HEIGHT: 31,

    create(seed, player) {
        const random = alea(seed)
        const types = createTypes()
        const weights = createRandomWeights()
        const actors = createActors()

        //makeLakes()
        carveCaves()
        removeSmallWalls()
        const size = removeOtherCaves()
        if (size < WIDTH * HEIGHT / 4) {
            return Level.create(random(), player)
        }
        fillSmallCaves()


        function createRandomWeights() {
            const weights = {}
            Level.forEachInnerPos(pos => {
                weights[pos] = random()
            })
            return weights
        }


        function createTypes() {
            const types = {}
            Level.forEachPos(pos => {
                types[pos] = Tiles.WALL
            })
            types[player.pos] = Tiles.FLOOR
            return types
        }


        function createActors() {
            const actors = {}
            actors[player.pos] = player
            return actors
        }


        function isFloor(pos) {
            return types[pos] === Tiles.FLOOR
        }


        function passable(pos) {
            return types[pos] === Tiles.FLOOR || types[pos] === Tiles.SHALLOW_WATER
        }


        function isWall(pos) {
            return Level.inBounds(pos) && types[pos] === Tiles.WALL
        }


        function makeLake() {
            const center = shuffle(Array.from(innerPositions), random)[0]
            const neighbors = (pos, callback) => {
                forEachNeighbor(pos, neighbor => {
                    if (innerPositions.has(neighbor)) {
                        callback(neighbor)
                    }
                })
            }
            const cost = pos => 0.1 + 0.3 * weights.get(pos)
            const lake = flowmap(center, 1, neighbors, cost)

            for ([pos, val] of lake) {
                const type = val < 0.6 ? Tiles.DEEP_WATER : Tiles.SHALLOW_WATER
                types.set(pos, type)
            }

            return lake
        }


        function makeLakes() {
            makeLake()
        }


        function carveCaves() {
            const innerPositions = [];
            Level.forEachInnerPos(pos => innerPositions.push(pos))
            shuffle(Array.from(innerPositions), random).forEach(pos => {
                if (isWall(pos) && countGroups(pos, passable) !== 1) {
                    types[pos] = Tiles.FLOOR
                }
            })
        }


        function removeSmallWalls() {
            const visited = new Set()
            Level.forEachInnerPos(pos => {
                const wallGroup = new Set()
                const floodable = pos => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos)
                const flood = pos => {
                    visited.add(pos)
                    wallGroup.add(pos)
                }
                floodfill(pos, floodable, flood)

                if (wallGroup.size < 6) {
                    for (const pos of wallGroup) {
                        types[pos] = Tiles.FLOOR
                    }
                }
            })
        }


        function removeOtherCaves() {
            const mainCave = new Set()
            floodfillSet(player.pos, passable, mainCave)

            Level.forEachInnerPos(pos => {
                if (types[pos] === Tiles.FLOOR && !mainCave.has(pos)) {
                    types[pos] = Tiles.WALL
                }
            })

            return mainCave.size
        }


        function isCave(pos) {
            return isFloor(pos) && countGroups(pos, passable) === 1
        }


        function isNotCave(pos) {
            return isWall(pos) || countGroups(pos, passable) !== 1
        }


        function isDeadEnd(pos) {
            return isFloor(pos)
            && countGroups(pos, passable) === 1
            && surrounded(pos, isNotCave)
        }


        function fillDeadEnd(pos) {
            if (isDeadEnd(pos)) {
                types[pos] = Tiles.WALL
                forEachNeighbor(pos, neighbor => {
                    if (pos === player.pos && passable(neighbor)) {
                        player.pos = neighbor
                    }
                    fillDeadEnd(neighbor)
                })
            }
        }


        function fillSmallCaves() {
            // can't skip visited tiles here because previous caves can be affected
            // by the removal of later ones
            Level.forEachInnerPos(pos => {
                fillDeadEnd(pos)
                const cave = new Set()
                floodfillSet(pos, isCave, cave)

                if (cave.size === 2 || cave.size === 3) {
                    types[pos] = Tiles.WALL
                    for (const pos of cave) {
                        fillDeadEnd(pos)
                    }
                }
            })
        }


        return {
            types,
            actors,
        }
    },

    xmin(y) {
        return Math.floor((this.HEIGHT - y) / 2)
    },

    xmax(y) {
        return WIDTH - Math.floor(y / 2)
    },

    inBounds(pos) {
        const {x, y} = pos2xy(pos)
        return y >= 0 && y < Level.HEIGHT && x >= Level.xmin(y) && x < Level.xmax(y)
    },

    inInnerBounds(pos) {
        const {x, y} = pos2xy(pos)
        return y > 0 && y < Level.HEIGHT - 1 && x > Level.xmin(y) && x < Level.xmax(y) - 1
    },

    forEachPos(fun) {
        for (let y = 0; y < Level.HEIGHT; y++) {
            const xmin = Level.xmin(y)
            const xmax = Level.xmax(y)
            for (let x = xmin; x < xmax; x++) {
                fun(xy2pos(x, y), x, y)
            }
        }
    },

    forEachInnerPos(fun) {
        for (let y = 1; y < Level.HEIGHT - 1; y++) {
            const xmin = Level.xmin(y) + 1
            const xmax = Level.xmax(y) - 1
            for (let x = xmin; x < xmax; x++) {
                fun(xy2pos(x, y), x, y)
            }
        }
    },
}
