/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document */

game.tiles = Object.create({
    /* Create a canvas for each tile with a cached glyph from the spritesheet */
    cache: function(spritesheet, spriteWidth, spriteHeight) {
        'use strict';
        for (var tilename in game.tiles) {
            if (game.tiles.hasOwnProperty(tilename)) {
                var tile = game.tiles[tilename];
                var canvas = document.createElement('canvas');
                canvas.width = spriteWidth;
                canvas.height = spriteHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(spritesheet, tile.spritex * spriteWidth, tile.spritey * spriteHeight, spriteWidth, spriteHeight,
                    0, 0, spriteWidth, spriteHeight);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = tile.color;
                ctx.fillRect(0, 0, spriteWidth, spriteHeight);
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
    spritex: 3,
    spritey: 4
};
game.tiles.floor = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'floor',
    char: '.',
    spritex: 1,
    spritey: 4
};
game.tiles.rubble = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'rubble',
    char: ',',
    spritex: 2,
    spritey: 4
};
game.tiles.tallGrass = {
    transparent: false,
    passable: true,
    color: '#282',
    name: 'tallGrass',
    char: '"',
    spritex: 4,
    spritey: 4
};
game.tiles.grass = {
    transparent: true,
    passable: true,
    color: '#060',
    name: 'grass',
    char: '\'',
    spritex: 5,
    spritey: 4
};
game.tiles.corridor = {
    transparent: true,
    passable: true,
    color: '#008800',
    name: 'corridor',
    char: '.',
    spritex: 1,
    spritey: 4
};
game.tiles.downstairs = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'downstairs',
    char: '>',
    spritex: 8,
    spritey: 4
};
game.tiles.upstairs = {
    transparent: true,
    passable: true,
    color: '#bbbbbb',
    name: 'upstairs',
    char: '<',
    spritex: 7,
    spritey: 4
};
game.tiles.player = {
    transparent: true,
    color: '#bbbbbb',
    name: 'player',
    char: '@',
    spritex: 6,
    spritey: 4
};
game.tiles.vanilla = {
    transparent: true,
    color: '#bbbbbb',
    name: 'vanilla',
    char: 'v',
    spritex: 8,
    spritey: 3
};
game.tiles.giant = {
    transparent: false,
    color: '#ee8888',
    name: 'giant',
    char: 'G',
    spritex: 6,
    spritey: 0
};
game.tiles.jacksnake = {
    transparent: true,
    color: '#dd0000',
    name: 'jacksnake',
    char: 'S',
    spritex: 5,
    spritey: 1
};

game.tiles.tallGrass.stepIn = function(x, y) {
    'use strict';
    var tile = game.map[x][y];
    game.map[x][y] = Object.create(game.tiles.grass);
    game.map[x][y].actor = tile.actor;
    game.map[x][y].visible = tile.visible;
    game.map[x][y].drawn = !tile.visible;
    game.map[x][y].light = 0;
    game.schedule.add(function() {
        var tile = game.map[x][y];
        game.map[x][y] = Object.create(game.tiles.tallGrass);
        game.map[x][y].actor = tile.actor;
        game.map[x][y].visible = tile.visible;
        game.map[x][y].drawn = !tile.visible;
        game.map[x][y].light = 0;
        return game.schedule.advance()();
    }, 200 + Math.random() * 400);
};
