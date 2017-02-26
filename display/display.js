// Creates a GUI for the game

this.Display = {
    xu: 18,
    smallyu: 16,
    bigyu: 24,
    $root: document.getElementById('game'),
    game: Game.getGame(),

    create() {

    },

    createTiles() {
        const $tiles = document.createElement('div')
        $tiles.setAttribute('id', 'tiles')
        $root.appendChild($tiles)


    },
}

function oldDisplay() {
    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    const types = new Map();

    const tiles = new Map();
    const $tiles = document.getElementById('tiles');

    const display = {
        setTile,
        over: drawTiles,
    };

    function receive(commandName, ...args) {
        const command = commands[commandName];
        if (!command) {
            throw `${commandName.toString()} is not a valid command`;
        }
        command(...args);
    }

    function init() {
        let game = Game.load();
        if (!game) {
            game = Game.create(Date.now());
        }
        if (game.version !== Game.version) {
            alert('Save game is out of date')
        }
        const seed = game.seed
        console.log('Seed:', seed)

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
}
