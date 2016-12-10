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


    carveCaves() {
        shuffle(Array.from(this.innerPositions), this.random).forEach(pos => {
            if (countGroups(pos, pos => this.passable.has(pos)) !== 1) {
                this.passable.add(pos);
            }
        });
    },


    removeSmallWalls() {
        for (const pos of this.innerPositions) {
            const wallGroup = new Set();
            const floodable = pos => this.positions.has(pos) && !wallGroup.has(pos) && !this.passable.has(pos);
            const flood = pos => wallGroup.add(pos);
            floodfill(pos, floodable, flood);
            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    this.passable.add(pos);
                }
            }
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
    return level;
}
