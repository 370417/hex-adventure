/* jshint undef: true, shadow: true, strict: true, -W083 */
/* globals rlt, game, document, console, window, performance */

game.mode.play = {
    init: function(options) {
        'use strict';
        console.log('Link...');
        // reset canvases
        game.ctx.clearRect(0, 0, game.width * game.tileWidth, game.height * game.tileHeight);
        game.bgCtx.clearRect(0, 0, game.width * game.tileWidth, game.height * game.tileHeight);
        // set depth and openness
        game.mode.play.depth = options.depth || 1;
        // init game map
        var mapOptions = {
            openness: 1.0
        };
        if (options.depth) {
        	mapOptions.openness = rlt.clamp(1 - options.depth / 10, 0.2, 1);
        }
        if (options && options.stairs) {
            mapOptions.stairs = {
                x: options.stairs.x,
                y: options.stairs.y,
                name: options.stairs.name
            };
        }
        var map = game.newCave(game.width, game.height, false, Math.random, mapOptions);
        game.map = rlt.array2d(game.width, game.height, function(x, y) {
            return Object.create(game.tiles[map[x][y]]);
        });
        // weight open tiles based on openness
        var weights = game.weight(rlt.array2d(game.width, game.height, 0));
        // normalize weights - divide each weight by the largest portion of tiles lit in a single fov
        var maxWeight = 0;
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                if (weights[x][y] > maxWeight) {
                    maxWeight = weights[x][y];
                }
            }
        }
        console.log(weights);
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                weights[x][y] = weights[x][y] / maxWeight;
                game.map[x][y].light = weights[x][y];
            }
        }
        // place stairs in a well-lit area
        var stairs = game.getRandTile(function(x, y) {
            return game.map[x][y].passable && x > 1 && x < game.width - 2 && y > 1 && y < game.height - 2;
        }, function(x, y) {
            return game.map[x][y].light;
        });
        var light = game.map[stairs.x][stairs.y].light;
        var newStairs = 'downstairs';
        if (options && options.stairs && options.stairs.name === 'downstairs') {
            newStairs = 'upstairs';
        }
        game.map[stairs.x][stairs.y] = Object.create(game.tiles[newStairs]);
        game.map[stairs.x][stairs.y].light = light;
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
        // cache new colors
        game.cacheMapTiles(game.map, game.spritesheet, 8, 8, 2);
        // create player (temp)
        game.player = Object.create(game.Player);
        game.player.x = 0;
        game.player.y = 0;
        game.player.tile = Object.create(game.tiles.player);
        // place player
        if (options && options.stairs) {
            game.player.x = options.stairs.x;
            game.player.y = options.stairs.y;
        } else {
            while (!game.passable(game.player.x, game.player.y)) {
                game.player.x = rlt.random(1, game.width - 1, Math.random);
                game.player.y = rlt.random(1, game.height - 1, Math.random);
            }
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
        window.addEventListener('keyup', game.mode.play.keyup, false);
        console.log('...start!');
    },
    depth: 1,
    open: function() {
        'use strict';
        window.addEventListener('keydown', game.mode.play.keydown, false);
        window.addEventListener('keyup', game.mode.play.keyup, false);
    },
    draw: function(map) {
        'use strict';
        game.display.ctx.clearRect(0, 0, game.tileWidth * game.width, game.tileHeight * game.height);
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                var tile = map[x][y];
                if (tile.actor) {
                    var tile = tile.actor.tile;
                    game.display.drawBitmap(game.spritesheet, tile.spritex, tile.spritey, 8, 8, x, y, tile.color, 2);
                } else if (true || tile.visible) {
                    game.display.drawCached(tile.canvas, x, y);
                    //game.display.drawBitmap(game.spritesheet, tile.spritex, tile.spritey, 8, 8, x, y, tile.color, 2);
                } else if (tile.seen && !tile.drawn) {
                    game.bgDisplay.drawCached(tile.canvas, x, y);
                    //game.bgDisplay.drawBitmap(game.spritesheet, tile.spritex, tile.spritey, 8, 8, x, y, tile.color, 2);
                    tile.drawn = true;
                }
            }
        }
    },
    close: function() {
        'use strict';
        window.removeEventListener('keydown', game.mode.play.keydown, false);
    },
    pressed: '',
    movedDiagonally: false,
    keydown: function(e) {
        'use strict';
        try {
        var key = game.key[e.keyCode] || e.key;
        game.directionPressed(game.mode.play, key, game.player.move);
        // ranged combat
        if (key === 'f') {
            game.mode.play.close();
            game.mode.ranged.open();
        }
        if (key === ' ') {
            var tile = game.map[game.player.x][game.player.y];
            // downstairs
            if (tile.name === 'downstairs') {
                game.mode.play.close();
                game.mode.play.init({
                    stairs: {
                        x: game.player.x,
                        y: game.player.y,
                        name: 'upstairs'
                    },
                    depth: ++game.mode.play.depth
                });
            }
            // upstairs
            if (tile.name === 'upstairs') {
                game.mode.play.close();
                game.mode.play.init({
                    stairs: {
                        x: game.player.x,
                        y: game.player.y,
                        name: 'downstairs'
                    },
                    depth: --game.mode.play.depth
                });
            }
        }
        } catch (err) {
            console.log(err);
        }
    },
    keyup: function(e) {
        'use strict';
        var key = game.key[e.keyCode] || e.key;
        game.directionReleased(game.mode.play, key, game.player.move);
    }
};
