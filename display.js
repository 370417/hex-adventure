function Display($root, tiles) {
        const xu = 18;
        const smallyu = 16;
        const bigyu = 24;

        tiles = new Map();
        $tiles = document.getElementById('tiles');

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = Math.floor((HEIGHT - y) / 2); x < WIDTH - Math.floor(y / 2); x++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tiles.set(xy2pos(x, y), tile);
                $tiles.appendChild(tile);
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

        return {
            drawTile,
        };
    }
