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
            const [x, y] = pos2xy(pos);
            tile = this.tiles[type];
            const ctx = this.ctxs[y];
            const realx = (x - (height - y - 1) / 2) * xu;
            ctx.drawImage(tile.canvas, 0, 0, xu, bigyu, realx, 0, xu, bigyu);
        },
    };

    this.Display = function($root, tiles) {
        const display = Object.create(protoDisplay);

        const $canvases = document.createElement('div');
        $canvases.setAttribute('id', 'canvases');
        const canvaseswidth = (WIDTH - HEIGHT / 2 + 1) * xu;
        const canvasesheight = bigyu + (HEIGHT - 1) * smallyu;
        $canvases.style.width = canvaseswidth + 'px';
        $canvases.style.height = canvasesheight + 'px';

        const canvases = [];
        const ctxs = [];
        for (let y = 0; y < HEIGHT; y++) {
            const canvas = document.createElement('canvas');
            canvas.width = canvaseswidth;
            canvas.height = bigyu;
            canvas.style.top = y * smallyu + 'px';
            const ctx = canvas.getContext('2d');
            canvases[y] = canvas;
            ctxs[y] = ctx;
            $canvases.appendChild(canvas);
        }
        $root.appendChild($canvases);
        display.ctxs = ctxs;

        return display;
    }
})();
