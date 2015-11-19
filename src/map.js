/* jshint undef: true, shadow: true, strict: true */
/* globals game, console, rlt */

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

    // Whether or not the map tile at (x, y) is surrounded by a certain tile in certain directions
    var surrounded = function(x, y, tile, directions) {
        for (var i = 0; i < directions.length; i++) {
            if (map[x + directions[i][0]][y + directions[i][1]] !== tile) {
                return false;
            }
        }
        return true;
    };

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
        return count;
    };

    // array of shuffled indeces used to iterate through map randomly
    var indeces = rlt.shuffledRange((width-2)*(height-2), prng);
    // iterate through the map randomly
    for (var i = 0; i < (width-2)*(height-2); i++) {
        var j = indeces[i];
        var x = 1 + Math.floor(j / (height-2));
        var y = 1 + j - (x-1) * (height-2);
        // assign a tile randomly if it is surrounded by walls
        if (surrounded(x, y, 'wall', rlt.dir8)) {
            if (prng() < openness) map[x][y] = 'floor';
            else map[x][y] = 'wall';
        } else {
            if (wallGroups(x, y) === 1) {
                map[x][y] = 'wall';
            } else {
                map[x][y] = 'floor';
            }
        }
    }

    // remove awkward walls
    var toRemove = [];
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < width - 1; y++) {
            if (surrounded(x, y, 'floor', rlt.dir4)) {
                toRemove.push([x, y]);
            }
        }
    }
    for (var i = 0; i < toRemove.length; i++) {
        map[toRemove[i][0]][toRemove[i][1]] = 'floor';
    }

    // floodfill areas using a*
    var floodcost = function(x, y) {
        if (map[x][y] === 'wall') return -1;
        else return 1;
    };
    var noheuristic = function(x, y) {
        return 0.1;
    };
    // fill an area with a certain value
    var fill = function(tiles, value) {
        for (var i = 0; i < tiles.length; i++) {
            map[tiles[i].x][tiles[i].y] = value;
        }
    };
    // list of sizes of each distinct area
    var areaSizes = [];
    for (var x = 1; x < width - 1; x++) {
        for (var y = 1; y < width - 1; y++) {
            if (map[x][y] === 'floor') {
                var tiles = rlt.astar(x, y, floodcost, noheuristic, rlt.dir4);
                fill(tiles, areaSizes.length);
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
            if (typeof map[x][y] === 'number' && !connected[map[x][y]] && areaSizes[map[x][y]] > 4) {
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

    return map;
};

game.passable = function(x, y) {
    'use strict';
    return game.map[x][y].passable;
};

game.transparent = function(x, y) {
    'use strict';
    return game.map[x][y].transparent;
};
