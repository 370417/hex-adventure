/* jshint undef: true, shadow: true, strict: true, -W083 */
/* globals game, console, rlt, document */

game.newCave = function(width, height, callback, prng, options) {
    'use strict';
    prng = prng || Math.random;
    options = options || {};
    var openness = options.openness || 0.8;
    // 2d array representation of map
    var map = [];
    for (var x = 0; x < width; x++) {
        map[x] = [];
        for (var y = 0; y < height; y++) {
            map[x][y] = 'wall';
        }
    }
    // 2d array for number of orthogonal floor neighbors
    var floorCount = [];
    for (var x = 0; x < width; x++) {
        floorCount[x] = [];
        for (var y = 0; y < height; y++) {
            floorCount[x][y] = 0;
        }
    }

    // Count the number of contiguous groups of walls surrounding a tile
    var wallGroups = function(x, y) {
        // count the number of transitions from wall to floor
        var count = 0;
        var prev = map[x + rlt.dir8[7][0]][y + rlt.dir8[7][1]];
        for (var i = 0; i < 8; i++) {
            var next = map[x + rlt.dir8[i][0]][y + rlt.dir8[i][1]];
            if (prev === 'wall' && next === 'floor') {
                count++;
            }
            prev = next;
        }
        // in the case of being surrounded by walls, return 'surrounded'
        if (count === 0 && prev === 'wall') {
            return 'surrounded';
        }
        return count;
    };

    // turn a map tile into floor and update neighbor floor counts
    var makeFloor = function(x, y) {
        map[x][y] = 'floor';
        for (var i = 0; i < 4; i++) {
            floorCount[x+rlt.dir4[i][0]][y+rlt.dir4[i][1]]++;
        }
    };

    // array of shuffled indeces used to iterate through map randomly
    var indeces = rlt.shuffledRange((width-2)*(height-2), prng);
    // iterate through the map randomly
    for (var i = 0; i < (width-2)*(height-2); i++) {
        var j = indeces[i];
        var x = 1 + Math.floor(j / (height-2));
        var y = 1 + j - (x-1) * (height-2);
        var walls = wallGroups(x, y);
        // if a tile is surrounded by walls, randomly make it floor
        if (walls === 'surrounded') {
            if (prng() < openness) makeFloor(x, y);
        // if a tile is surrounded by floor or is next to two unconnected regions
        // of floor, make it floor
        } else if (walls !== 1) {
            makeFloor(x, y);
        }
    }

    // remove awkward walls
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < width - 1; y++) {
            if (map[x][y] === 'wall' && floorCount[x][y] === 4) {
                map[x][y] = 'floor';
            }
        }
    }

    // floodfill areas using a*
    var areaSizes = [];
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < width - 1; y++) {
            if (map[x][y] === 'floor') {
                var tiles = rlt.astar(x, y, function(x, y) {
                    // cost
                    if (map[x][y] === 'wall') return -1;
                    else return 1;
                }, function() {
                    // heuristic
                    return 0.001;
                }, rlt.dir4);
                for (var i = 0; i < tiles.length; i++) {
                    map[tiles[i].x][tiles[i].y] = areaSizes.length;
                }
                areaSizes.push(tiles.length);
            }
        }
    }
    // find the largest area
    var largestArea = 0;
    var largestAreaIndex = 0;
    for (var i = 0; i < areaSizes.length; i++) {
        if (areaSizes[i] > largestArea) {
            largestArea = areaSizes[i];
            largestAreaIndex = i;
        }
    }

    // connect smaller areas to the largest one
    var pathcost = function(x, y) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
            return -1;
        }
        var tile = map[x][y];
        if (tile === 'wall') {
            return 3;
        } else if (tile === 'corridor') {
            return 0.5;
        } else {
            return 1;
        }
    };

    var pathheuristic = function(x, y) {
        if (map[x][y] === largestAreaIndex) {
            return 0;
        } else {
            return 0.1;
        }
    };

    var connected = [];
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < width - 1; y++) {
            if (options && options.stairs && x === options.stairs.x && y === options.stairs.y ||
                typeof map[x][y] === 'number' && !connected[map[x][y]] && areaSizes[map[x][y]] > 4) {
                var node = rlt.astar(x, y, pathcost, pathheuristic, rlt.dir4);
                while (node.parent) {
                    if (map[node.x][node.y] === 'wall') {
                        map[node.x][node.y] = 'corridor';
                    } else {
                        map[node.x][node.y] = 'floor';
                    }
                    node = node.parent;
                }
                connected[map[x][y]] = true;
            }
        }
    }

    // fill all the areas with floor
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < height - 1; y++) {
            if (typeof map[x][y] === 'number') {
                if (areaSizes[map[x][y]] > 4) {
                    map[x][y] = 'floor';
                } else {
                    map[x][y] = 'wall';
                }
            }
        }
    }

    // place stairs
    if (options.stairs) {
        map[options.stairs.x][options.stairs.y] = options.stairs.name;
    }

    return map;
};

/**
 * Takes an array of 0s and weights it based on number of tiles in fov
 * @return the array
 */
game.weight = function(array) {
    'use strict';
    var iterations = 100;
    for (var x = 1; x < game.width - 1; x++) {
        for (var y = 1; y < game.height - 1; y++) {
            if (game.transparent(x, y)) {
                rlt.shadowcast(x, y, game.transparent, function(x, y) {
                    array[x][y]++;
                });
            }
        }
    }
    return array;
};

game.passable = function(x, y) {
    'use strict';
    return game.map[x][y].passable;
};

game.transparent = function(x, y) {
    'use strict';
    return game.map[x][y].transparent;
};

game.visible = function(x, y) {
    'use strict';
    return game.map[x][y].visible;
};

game.cacheMapTiles = function(map, spritesheet, spriteWidth, spriteHeight, scale) {
    'use strict';
    for (var x = 0; x < map.length; x++) {
        for (var y = 0; y < map[0].length; y++) {
            var tile = map[x][y];
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
};

game.getRandTile = function(eligible, weight) {
    'use strict';
    var tilex = [];
    var tiley = [];
    var weights = [];
    var i = 0;
    for (var x = 0; x < game.width; x++) {
        for (var y = 0; y < game.height; y++) {
            if (eligible(x, y)) {
                tilex[i] = x;
                tiley[i] = y;
                weights[i] = (weights[i-1] || 0) + weight(x, y);
                i++;
            }
        }
    }
    var index = rlt.randomIndex(weights, Math.random, false);
    return {
        x: tilex[index],
        y: tiley[index]
    };
};
