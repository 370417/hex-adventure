/* jshint undef: true, shadow: true, strict: true, -W083 */
/* globals rlt, game, document, console, window */

game.mode.play = {
    init: function() {
        'use strict';
        console.log('Link...');
        // reset canvas
        game.ctx.clearRect(0, 0, game.width * game.tileWidth, game.height * game.tileHeight);
        // init game map
        var map = game.newCave(game.width, game.height, false, Math.random, {
            openness: 0.8
        });
        game.map = rlt.array2d(game.width, game.height, function(x, y) {
            return Object.create(game.tiles[map[x][y]]);
        });
        // weight open tiles based on openness
        var weight = function(array) {
            var iterations = 100;
            var weightsPerIter = [];
            for (var i = 0; i < iterations; i++) {
                var x = 0;
                var y = 0;
                weightsPerIter[i] = 0;
                while (!game.passable(x, y)) {
                    x = rlt.random(1, game.width - 1, Math.random);
                    y = rlt.random(1, game.height - 1, Math.random);
                }
                rlt.shadowcast(x, y, game.transparent, function(x, y) {
                    array[x][y]++;
                    weightsPerIter[i]++;
                });
            }
            return weightsPerIter;
        };
        var weights = rlt.array2d(game.width, game.height, 0);
        var weightsPerIter = weight(weights);
        var maxWeightPerIter = Math.max.apply(null, weightsPerIter);
        // normalize weights - divide each weight by the largest portion of tiles lit in a single fov
        var openTiles = 0;
        var maxWeight = 0;
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                if (game.passable(x, y)) {
                    openTiles++;
                }
                if (weights[x][y] > maxWeight) {
                    maxWeight = weights[x][y];
                }
            }
        }
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                weights[x][y] = weights[x][y] / maxWeightPerIter / 100 * openTiles;
            }
        }
        // (temp) color tiles based on openness
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                var color;
                if (game.passable(x, y)) {
                    color = rlt.arr2rgb([
                        Math.round(50 + 200 * weights[x][y]),
                        Math.round(50 + 200 * weights[x][y]),
                        Math.round(50 + 200 * weights[x][y])
                    ]);
                } else {
                    color = rlt.arr2rgb([
                        Math.round(50 + 200 * weights[x][y]),
                        Math.round(30 + 220 * weights[x][y]),
                        Math.round(10 + 230 * weights[x][y])
                    ]);
                }
                game.map[x][y].color = color;
            }
        }
        // create player (temp)
        game.player = Object.create(game.Player);
        game.player.x = 0;
        game.player.y = 0;
        game.player.tile = game.tiles.player;
        while (!game.passable(game.player.x, game.player.y)) {
            game.player.x = rlt.random(1, game.width - 1, Math.random);
            game.player.y = rlt.random(1, game.height - 1, Math.random);
        }
        game.map[game.player.x][game.player.y].actor = game.player;
        rlt.shadowcast(game.player.x, game.player.y, game.transparent, function(x, y) {
            game.map[x][y].visible = true;
        });
        // init display
        game.display = rlt.Display({
            width: game.width,
            height: game.height,
            canvas: game.canvas,
            tileWidth: game.tileWidth,
            tileHeight: game.tileHeight
        });
        // init bg display
        game.bgDisplay = rlt.Display({
            width: game.width,
            height: game.height,
            canvas: game.bgCanvas,
            tileWidth: game.tileWidth,
            tileHeight: game.tileHeight
        });
        // test draw
        game.mode.play.draw(game.map);
        // add keyboard listeners
        window.addEventListener('keydown', game.mode.play.keydown, false);
        console.log('...start!');
    },
    draw: function(map) {
        'use strict';
        game.display.ctx.clearRect(0, 0, game.tileWidth * game.width, game.tileHeight * game.height);
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                var tile = map[x][y];
                if (tile.actor) {
                    game.display.drawCached(tile.actor.tile.canvas, x, y);
                } else if (tile.visible) {
                    //game.display.drawCached(tile.canvas, x, y);
                    game.display.drawBitmap(game.spritesheet, tile.spritex, tile.spritey, 8, 8, x, y, tile.color, 2);
                } else if (tile.seen && !tile.drawn) {
                    //game.bgDisplay.drawCached(tile.canvas, x, y);
                    game.bgDisplay.drawBitmap(game.spritesheet, tile.spritex, tile.spritey, 8, 8, x, y, tile.color, 2);
                    tile.drawn = true;
                }
            }
        }
    },
    keydown: function(e) {
        'use strict';
        var key = game.key[e.keyCode] || e.key;
        var numpadPressed = function(key, callback) {
            if (key === '1') {
                callback.call(game.player, -1, 1);
            }
            else if (key === '2') {
                callback.call(game.player, 0, 1);
            }
            else if (key === '3') {
                callback.call(game.player, 1, 1);
            }
            else if (key === '4') {
                callback.call(game.player, -1, 0);
            }
            else if (key === '5') {
                callback.call(game.player, 0, 0);
            }
            else if (key === '6') {
                callback.call(game.player, 1, 0);
            }
            else if (key === '7') {
                callback.call(game.player, -1, -1);
            }
            else if (key === '8') {
                callback.call(game.player, 0, -1);
            }
            else if (key === '9') {
                callback.call(game.player, 1, -1);
            }
        };
        numpadPressed(key, game.player.move);
    }
};
