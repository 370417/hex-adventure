/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document */

game.tiles = Object.create({
    /* Create a canvas for each tile with a cached glyph from the spritesheet */
    cache: function(spritesheet, spriteWidth, spriteHeight, scale) {
        'use strict';
        for (var tilename in game.tiles) {
            if (game.tiles.hasOwnProperty(tilename)) {
                var tile = game.tiles[tilename];
                var canvas = document.createElement('canvas');
                canvas.width = scale * spriteWidth;
                canvas.height = scale * spriteHeight;
                var ctx = canvas.getContext('2d');
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(spritesheet, tile.spritex * spriteWidth, tile.spritey * spriteHeight, spriteWidth, spriteHeight, 0, 0, spriteWidth * scale, spriteHeight * scale);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = tile.color;
                ctx.fillRect(0, 0, scale * spriteWidth, scale * spriteHeight);
                tile.canvas = canvas;
            }
        }
    }
});

game.tiles.wall = {
    transparent: false,
    passable: false,
    color: '#aaaaaa',
    name: 'wall',
    char: '#',
    spritex: 2,
    spritey: 3
};
game.tiles.floor = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'floor',
    char: '.',
    spritex: 2,
    spritey: 14
};
game.tiles.corridor = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'floor',
    char: '.',
    spritex: 2,
    spritey: 14
};
