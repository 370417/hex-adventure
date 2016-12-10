const protolevel = {
    createPositions() {
        const positions = {};
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                positions[xy2pos(x, y)] = true;
            }
        }
        return positions;
    },


    createInnerPositions() {
        const innerPositions = {};
        for (let y = 1; y < HEIGHT - 1; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) + 1; x < WIDTH - Math.floor(y / 2) - 1; x++) {
                innerPositions[xy2pos(x, y)] = true;
            }
        }
        return innerPositions;
    },


    createPassable() {
        const passable = {};
        for (const pos in this.positions) {
            passable[pos] = false;
        }
        passable[this.startpos] = true;
        return passable;
    },


    carveCaves() {
        shuffle(Object.keys(this.innerPositions), this.random).forEach(pos => {
            if (countGroups(Number(pos), pos => this.passable[pos]) !== 1) {
                this.passable[pos] = true;
            }
        });
    },


    removeSmallWalls() {
        for (const pos in this.innerPositions) {
            const wallGroup = new Set();
            const floodable = pos => pos in this.passable && !wallGroup.has(pos) && !this.passable[pos];
            const flood = pos => wallGroup.add(pos);
            floodfill(Number(pos), floodable, flood);
            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    this.passable[pos] = true;
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
