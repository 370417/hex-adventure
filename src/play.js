/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.mode.play = {
    init: function() {
        'use strict';
        console.log('Link...');
        // init game map
        var map = game.newCave(game.width, game.height, false, Math.random, {
            openness: 0.8
        });
        game.map = rlt.array2d(game.width, game.height, function(x, y) {
            return Object.create(game.tiles[map[x][y]]);
        });
        // init display
        game.display = rlt.Display({
            width: game.width,
            height: game.height,
            canvas: game.canvas,
            tileWidth: game.tileWidth,
            tileHeight: game.tileHeight
        });
        // test draw
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                var tile = game.tiles[map[x][y]];
                game.display.drawCached(tile.canvas, x, y);
            }
        }
        console.log('...start!');
    }
};
