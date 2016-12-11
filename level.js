function Level(startpos) {
    const random = alea('example seed');
    const positions = createPositions();
    const innerPositions = createInnerPositions();
    const passable = new Set([startpos]);
    carveCaves();
    removeSmallWalls();
    removeOtherCaves();
    //fillDeadEnds();
    fillSmallCaves();


    function createPositions() {
        const positions = new Set();
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                positions.add(xy2pos(x, y));
            }
        }
        return positions;
    }


    function createInnerPositions() {
        const innerPositions = new Set();
        for (let y = 1; y < HEIGHT - 1; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) + 1; x < WIDTH - Math.floor(y / 2) - 1; x++) {
                innerPositions.add(xy2pos(x, y));
            }
        }
        return innerPositions;
    }


    function isFloor(pos) {
        return passable.has(pos);
    }


    function isWall(pos) {
        return positions.has(pos) && !passable.has(pos);
    }


    function carveCaves() {
        shuffle(Array.from(innerPositions), random).forEach(pos => {
            if (countGroups(pos, isFloor) !== 1) {
                passable.add(pos);
            }
        });
    }


    function removeSmallWalls() {
        for (const pos of innerPositions) {
            const wallGroup = new Set();
            floodfill(pos, isWall, wallGroup);

            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    passable.add(pos);
                }
            }
        }
    }


    function removeOtherCaves() {
        const mainCave = new Set();
        floodfill(startpos, isFloor, mainCave);

        for (const pos of innerPositions) {
            if (!mainCave.has(pos)) {
                passable.delete(pos);
            }
        }
    }


    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, isFloor) === 1;
    }


    function isDeadEnd(pos) {
        return isFloor(pos)
            && countGroups(pos, isFloor) === 1
            && surrounded(pos, pos => !isCave(pos));
    }


    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            passable.delete(pos);
            forEachNeighbor(pos, neighbor => {
                if (pos === startpos && passable.has(neighbor)) {
                    startpos = neighbor;
                }
                fillDeadEnd(neighbor);
            });
        }
    }


    function fillSmallCaves() {
        for (const pos of innerPositions) {
            fillDeadEnd(pos);
            const cave = new Set();
            floodfill(pos, isCave, cave);
            if (cave.size === 2 || cave.size === 3) {
                passable.delete(pos);
                for (const pos of cave) {
                    fillDeadEnd(pos);
                }
            }
        }
    }


    return {
        positions,
        innerPositions,
        passable,
    };
}
