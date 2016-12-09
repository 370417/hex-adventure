(() => {
    function createPositions() {
        const positions = {};
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                positions[xy2pos(x, y)] = true;
            }
        }
        return positions;
    }


    function createInnerPositions() {
        const innerPositions = {};
        for (let y = 1; y < HEIGHT - 1; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) + 1; x < WIDTH - Math.floor(y / 2) - 1; x++) {
                innerPositions[xy2pos(x, y)] = true;
            }
        }
        return innerPositions;
    }


    const protoLevel = {
        initPositions(WIDTH, HEIGHT) {
            this.positions = Map(WIDTH);
            forEachTileOfLevel(WIDTH, HEIGHT, (x, y) => {
                this.positions.set(x, y, true);
            });

            this.innerPositions = Map(WIDTH);
            forEachInnerTileOfLevel(WIDTH, HEIGHT, (x, y) => {
                this.innerPositions.set(x, y, true);
            });
        },
    };


    function Level(WIDTH, HEIGHT) {
        const level = {
            map: Map(WIDTH),
        };
    }


    this.Level = Level;
})();
