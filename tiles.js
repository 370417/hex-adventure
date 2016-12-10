const tilemap = {
    wall: {
        x: 0,
        y: 0,
        color: '#EEE',
    },
    floor: {
        x: 1,
        y: 0,
        color: '#FFF',
    },
};


function loadTiles(source, tilemap, xu, yu, callback) {
    const tileset = document.createElement('img');

    tileset.addEventListener('load', () => {
        const tiles = {};

        for (const type in tilemap) {
            const {x, y, color} = tilemap[type];

            const canvas = document.createElement('canvas');
            canvas.width = xu;
            canvas.height = yu;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(tileset, x * xu, y * yu, xu, yu, 0, 0, xu, yu);

            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, xu, yu);

            tiles[type] = canvas;
        }

        callback(tiles);
    });

    tileset.src = source;
}
