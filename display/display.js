// Creates a GUI for the game

function Display() {
    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    const types = new Map();

    const upTriangles = new Map();
    const downTriangles = new Map();

    const tiles = new Map();
    const $tiles = document.getElementById('tiles');

    const send = Game(receive);

    const commands = {
        [SET_TILE]: setTile,
        [OVER]: drawTiles,
    };

    function receive(commandName, ...args) {
        const command = commands[commandName];
        if (!command) {
            throw `${commandName.toString()} is not a valid command`;
        }
        command(...args);
    }

    function init() {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tiles.set(xy2pos(x, y), tile);
                $tiles.appendChild(tile);
            }
        }

        for (let y = 0; y <= HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) - 1; x < WIDTH - Math.floor(y / 2); x++) {
                const upTriangle = document.createElement('div');
                upTriangle.classList.add('tile');
                upTriangles.set(xy2pos(x, y), upTriangle);
                $tiles.appendChild(upTriangle);   
            }
        }

        for (let y = -1; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2) - 1; x < WIDTH - Math.floor(y / 2); x++) {
                const downTriangle = document.createElement('div');
                downTriangle.classList.add('tile');
                downTriangles.set(xy2pos(x, y), downTriangle);
                $tiles.appendChild(downTriangle);
            }
        }
    }

    function drawTile(pos, type) {
        const {x, y} = pos2xy(pos);

        const realx = (x - (HEIGHT - y - 1) / 2) * 18;
        const realy = y * 16;

        const tile = tiles.get(pos);

        tile.className = 'tile ' + type;

        tile.style.left = realx + 'px';
        tile.style.top = realy + 'px';
    }

    function drawUpTriangle(SWpos, triangle) {
        const {x, y} = pos2xy(SWpos);

        const SW = Number(types.get(SWpos) === WALL);
        const N = Number(types.get(SWpos + dir1) === WALL);
        const SE = Number(types.get(SWpos + dir3) === WALL);

        const index = SW + 2 * SE + 4 * N;

        const realx = (x + 0.5 - (HEIGHT - y - 1) / 2) * 18;
        const realy = (y - 0.5) * 16;

        triangle.className = 'tile WALL' + index;

        triangle.style.left = realx + 'px';
        triangle.style.top = realy + 'px';
    }

    function drawDownTriangle(NWpos, triangle) {
        const {x, y} = pos2xy(NWpos);

        const NW = Number(types.get(NWpos) === WALL);
        const S = Number(types.get(NWpos + dir5) === WALL);
        const NE = Number(types.get(NWpos + dir3) === WALL);

        const index = NW + 2 * NE + 4 * S;

        const realx = (x + 0.5 - (HEIGHT - y - 1) / 2) * 18;
        const realy = (y + 0.5) * 16;

        triangle.className = 'tile dWALL' + index;

        triangle.style.left = realx + 'px';
        triangle.style.top = realy + 'px';
    }

    function drawTiles() {
        for (const [pos, type] of types) {
            drawTile(pos, type);
        }
        for (const [pos, triangle] of upTriangles) {
            drawUpTriangle(pos, triangle);
        }
        for (const [pos, triangle] of downTriangles) {
            drawDownTriangle(pos, triangle);
        }
    }

    function setTile(pos, type) {
        types.set(pos, type);
    }

    init();
    send(INIT, +Date.now());


    return {
        drawTile,
    };
}
