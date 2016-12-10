(() => {
    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    function drawTile(x, y, tileName) {
        tile = tiles[tileName];
        const ctx = ctxs[y];
        const realx = (x - (HEIGHT - y - 1) / 2) * xu;
        ctx.drawImage(tile.canvas, 0, 0, xu, bigyu, realx, 0, xu, bigyu);
    }

    const protoDisplay = {
        drawTile(pos, type) {
            const {x, y} = pos2xy(pos);

            const realx = (x - (HEIGHT - y - 1) / 2) * 18;
            const realy = y * 16;

            let tile;
            if (pos in this.tiles) {
                tile = this.tiles[pos];
                this.tiles[pos].type = type;
            } else {
                tile = document.createElement('div');
                tile.setAttribute('class', 'white ' + type + ' tile');
                this.tiles[pos] = {type, tile};
                this.$tiles.appendChild(tile);
            }
            tile.style.left = realx + 'px';
            tile.style.top = realy + 'px';
        },
    };

    this.Display = function($root, tiles) {
        const display = Object.create(protoDisplay);

        display.tiles = {};
        display.$tiles = document.getElementById('tiles');

        const canvaseswidth = (WIDTH - HEIGHT / 2 + 1) * xu;

        return display;
    }
})();
