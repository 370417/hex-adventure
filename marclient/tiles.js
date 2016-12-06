const tileset = document.createElement('img');

const tiles = {
    wall: {
        x: 0,
        y: 0,
        color: 'green',
    },
    floor: {
        x: 1,
        y: 0,
        color: 'green',
    }
};

function cacheTile(tile) {
    const canvas = document.createElement('canvas');
    canvas.width = xu;
    canvas.height = bigyu;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tileset, tile.x * xu, tile.y * bigyu, xu, bigyu, 0, 0, xu, bigyu);
    ctx.fillStyle = tile.color;
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillRect(0, 0, xu, bigyu);
    tile.canvas = canvas;
}

function onload() {
    for (const tileName in tiles) {
        const tile = tiles[tileName];
        cacheTile(tile);
    }
    startGame();
}

tileset.addEventListener('load', onload);
tileset.src = 'tileset.png';
