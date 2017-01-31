// Creates a GUI for the game

function Display() {
    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    const types = new Map();

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
    }

    function drawTile(pos, type) {
        const {x, y} = pos2xy(pos);

        const realx = (x - (HEIGHT - y - 1) / 2) * 18;
        const realy = y * 16;

        if (type === WALL) {
            const right = types.get(pos + dir5) === WALL;
            const left = types.get(pos + dir7) === WALL;
            if (right && left) {
                // WALL
            } else if (right) {
                type = 'R_WALL';
            } else if (left) {
                type = 'L_WALL';
            } else {
                type = 'RL_WALL';
            }
        }

        const tile = tiles.get(pos);
        tile.className = 'tile ' + type;

        tile.style.left = realx + 'px';
        tile.style.top = realy + 'px';
    }

    function drawTiles() {
        for (const [pos, type] of types) {
            drawTile(pos, type);
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
