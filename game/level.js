// Generates a new level

function forEach(obj, fun, ...args) {
    for (const key in obj) {
        fun(Number(key), ...args)
    }
}

this.Level = {
    WIDTH: 48,
    HEIGHT: 31,

    create(seed, player) {
        const random = alea(seed)
        const positions = createPositions()
        const innerPositions = createInnerPositions()
        const types = createTypes()
        const weights = createRandomWeights()
        const actors = createActors()

        //makeLakes()
        carveCaves()
        removeSmallWalls()
        const size = removeOtherCaves()
        if (size < WIDTH * HEIGHT / 4) {
            return Level.create({player, seed: random()})
        }
        fillSmallCaves()


        function createPositions() {
            const positions = new Set()
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                    positions.add(xy2pos(x, y))
                }
            }
            return positions
        }


        function createInnerPositions() {
            const innerPositions = new Set()
            for (let y = 1; y < HEIGHT - 1; y++) {
                for (let x = Math.floor((HEIGHT - y) / 2) + 1; x < WIDTH - Math.floor(y / 2) - 1; x++) {
                    innerPositions.add(xy2pos(x, y))
                }
            }
            return innerPositions
        }


        function createRandomWeights() {
            const weights = new Map()
            for (const pos of innerPositions) {
                weights.set(pos, random())
            }
            return weights
        }


        function createTypes() {
            const types = new Map()
            for (const pos of positions) {
                if (pos === player.pos) {
                    types.set(pos, FLOOR)
                } else {
                    types.set(pos, WALL)
                }
            }
            return types
        }


        function createActors() {
            const actors = new Map()
            actors.set(player.pos, player)
            return actors
        }


        function isFloor(pos) {
            return types.get(pos) === FLOOR
        }


        function passable(pos) {
            return types.get(pos) === FLOOR || types.get(pos) === SHALLOW_WATER
        }


        function isWall(pos) {
            return positions.has(pos) && types.get(pos) === WALL
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
                const type = val < 0.6 ? DEEP_WATER : SHALLOW_WATER
                types.set(pos, type)
            }

            return lake
        }


        function makeLakes() {
            makeLake()
        }


        function carveCaves() {
            shuffle(Array.from(innerPositions), random).forEach(pos => {
                if (isWall(pos) && countGroups(pos, passable) !== 1) {
                    types.set(pos, FLOOR)
                }
            })
        }


        function removeSmallWalls() {
            const visited = new Set()
            for (const pos of innerPositions) {
                const wallGroup = new Set()
                const floodable = pos => isWall(pos)
                && !wallGroup.has(pos)
                && !visited.has(pos)
                const flood = pos => {
                    visited.add(pos)
                    wallGroup.add(pos)
                }
                floodfill(pos, floodable, flood)

                if (wallGroup.size < 6) {
                    for (const pos of wallGroup) {
                        types.set(pos, FLOOR)
                    }
                }
            }
        }


        function removeOtherCaves() {
            const mainCave = new Set()
            floodfillSet(player.pos, passable, mainCave)

            for (const pos of innerPositions) {
                if (types.get(pos) === FLOOR && !mainCave.has(pos)) {
                    types.set(pos, WALL)
                }
            }

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
                types.set(pos, WALL)
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
            for (const pos of innerPositions) {
                fillDeadEnd(pos)
                const cave = new Set()
                floodfillSet(pos, isCave, cave)

                if (cave.size === 2 || cave.size === 3) {
                    types.set(pos, WALL)
                    for (const pos of cave) {
                        fillDeadEnd(pos)
                    }
                }
            }
        }


        return {
            positions,
            innerPositions,
            types,
            actors,
        }
    },

    forEachPos(fun) {
        for (let y = 0; y < this.HEIGHT; y++) {
            const xmin = Math.floor((this.HEIGHT - y) / 2)
            const xmax = WIDTH - Math.floor(y / 2)
            for (let x = xmin; x < xmax; x++) {
                fun(xy2pos(x, y), x, y)
            }
        }
    },

    forEachInnerPos(fun) {
        for (let y = 1; y < this.HEIGHT - 1; y++) {
            const xmin = Math.floor((this.HEIGHT - y) / 2)
            const xmax = WIDTH - Math.floor(y / 2)
            for (let x = xmin + 1; x < xmax - 1; x++) {
                fun(xy2pos(x, y), x, y)
            }
        }
    },
}
