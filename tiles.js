const protoTiles = {
    cacheTiles() {
        for (const type in this.tilemap) {
            const tile = this.tilemap[type];

            const canvas = document.createElement('canvas');
            canvas.width = this.xu;
            canvas.height = this.yu;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(this.tileset, tile.x * this.xu, tile.y * this.yu, this.yu, 0, 0, this.xu, this.yu);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillRect(0, 0, this.xu, this.yu);

            tile.canvas = canvas;
            this[type] = tile;
        }
    },
};


function Tiles(source, tilemap, xu, yu, callback) {
    const tiles = {
        tileset: document.createElement('img'),
        xu,
        yu,
        callback,
    };
    tiles.tileset.addEventListener('load', () => {
        tiles.cacheTiles();
        callback();
    }, false);
    tiles.tileset.src = source;
    return Object.create(protoTiles, tiles);
}

/*
const tileset = document.createElement('img');

const tiles = {
    wall: {
        x: 0,
        y: 0,
        color: '#F80',
    },
    floor: {
        x: 1,
        y: 0,
        color: '#F80',
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
tileset.src = 'tileset.png';*/
