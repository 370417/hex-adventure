// Creates a GUI for the game

function Display() {
    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    const tiles = new Map();
    const $tiles = document.getElementById('tiles');

    const send = Game(receive);

    const commands = {
        [SET_TILE]: drawTile,
        [OVER]: () => {},
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

        const tile = tiles.get(pos);
        tile.className = 'tile ' + type;
        //types.set(pos, type);

        tile.style.left = realx + 'px';
        tile.style.top = realy + 'px';
    }

    init();
    send(INIT, +Date.now());


    return {
        drawTile,
    };
}
