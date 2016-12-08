(() => {
    const width = 48;
    const height = 31;

    const xu = 18;
    const smallyu = 16;
    const bigyu = 24;

    const $canvases = document.getElementById('canvases');
    const canvaseswidth = (width - height / 2 + 1) * xu;
    const canvasesheight = bigyu + (height - 1) * smallyu;
    $canvases.style.width = canvaseswidth + 'px';
    $canvases.style.height = canvasesheight + 'px';

    const canvases = [];
    const ctxs = [];
    for (let y = 0; y < height; y++) {
        const canvas = document.createElement('canvas');
        canvas.width = canvaseswidth;
        canvas.height = bigyu;
        canvas.style.top = y * smallyu + 'px';
        const ctx = canvas.getContext('2d');
        canvases[y] = canvas;
        ctxs[y] = ctx;
        $canvases.appendChild(canvas);
    }

    function drawTile(x, y, tileName) {
        tile = tiles[tileName];
        const ctx = ctxs[y];
        const realx = (x - (height - y - 1) / 2) * xu;
        ctx.drawImage(tile.canvas, 0, 0, xu, bigyu, realx, 0, xu, bigyu);
    }
})();