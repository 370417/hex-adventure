const protolevel = {
    createPositions() {
        const positions = new Set();
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                positions.add(xy2pos(x, y));
            }
        }
        return positions;
    },


    createInnerPositions() {
        const innerPositions = new Set();
        for (let y = 1; y < HEIGHT - 1; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) + 1; x < WIDTH - Math.floor(y / 2) - 1; x++) {
                innerPositions.add(xy2pos(x, y));
            }
        }
        return innerPositions;
    },


    createPassable() {
        return new Set([this.startpos]);
    },


    isFloor(pos) {
        return this.passable.has(pos);
    },


    isWall(pos) {
        return this.positions.has(pos) && !this.passable.has(pos);
    },


    carveCaves() {
        shuffle(Array.from(this.innerPositions), this.random).forEach(pos => {
            if (countGroups(pos, this.isFloor.bind(this)) !== 1) {
                this.passable.add(pos);
            }
        });
    },


    removeSmallWalls() {
        for (const pos of this.innerPositions) {
            const wallGroup = new Set();
            const floodable = pos => this.isWall(pos) && !wallGroup.has(pos);
            const flood = pos => wallGroup.add(pos);
            floodfill(pos, floodable, flood);

            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    this.passable.add(pos);
                }
            }
        }
    },


    removeOtherCaves() {
        const mainCave = new Set();
        const floodable = pos => this.isFloor(pos) && !mainCave.has(pos);
        const flood = pos => mainCave.add(pos);
        floodfill(this.startpos, floodable, flood);

        for (const pos of this.innerPositions) {
            if (!mainCave.has(pos)) {
                this.passable.delete(pos);
            }
        }
    },


    isCave(pos) {
        return this.isFloor(pos) && countGroups(pos, this.isFloor.bind(this)) === 1;
    },


    isDeadEnd(pos) {
        return this.isFloor(pos)
            && countGroups(pos, this.isFloor.bind(this)) === 1
            && surrounded(pos, pos => !this.isCave(pos));
    },


    fillDeadEnd(pos) {
        if (this.isDeadEnd(pos)) {
            this.passable.delete(pos);
            forEachNeighbor(pos, neighbor => {
                if (pos === this.startpos && this.passable.has(neighbor)) {
                    this.startpos = neighbor;
                }
                this.fillDeadEnd(neighbor);
            });
        }
    },


    fillDeadEnds() {
        for (const pos of this.innerPositions) {
            this.fillDeadEnd(pos);
        }
    },
};


function Level(startpos) {
    const level = Object.create(protolevel);
    level.random = alea('example seed');
    level.startpos = startpos;
    level.positions = level.createPositions();
    level.innerPositions = level.createInnerPositions();
    level.passable = level.createPassable();
    level.carveCaves();
    level.removeSmallWalls();
    level.removeOtherCaves();
    level.fillDeadEnds();
    return level;
}
