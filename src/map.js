/* jshint undef: true, shadow: true, strict: true, -W083 */
/* globals game, console, rlt, document */

game.newCave = function(width, height, callback, prng, options) {
    'use strict';

    // for use as a cost function in a*
    var arrCellIs = function(arr, cell, x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height) return -1;
        return arr[x][y] === cell ? 1 : -1;
    };
    var noHeuristic = function(){
        return 1;
    }

    prng = prng || Math.random;
    options = options || {};
    var openness = options.openness || 0.8;
    var map = rlt.array2d(width, height, 'wall');
    var floorCount = rlt.array2d(width, height, 0);

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
        if (walls === 'surrounded' && prng() < openness || walls !== 1) makeFloor(x, y);
    }

    // remove awkward walls
    for (var x = 1; x < width - 1; x++) for (var y = 1; y < width - 1; y++) {
        if (map[x][y] === 'wall' && floorCount[x][y] === 4) {
            map[x][y] = 'floor';
        }
    }

    // floodfill areas using a*
    var areaSizes = [];
    var maxArea = 0;
    var maxAreaIndex = 0;
    for (var x = 1; x < width - 1; x++) for (var y = 1; y < width - 1; y++) {
        if (map[x][y] === 'floor') {
            var tiles = rlt.astar(x, y, arrCellIs.bind(null, map, 'floor'), noHeuristic, rlt.dir4);
            for (var i = 0; i < tiles.length; i++) {
                map[tiles[i].x][tiles[i].y] = areaSizes.length;
            }
            areaSizes.push(tiles.length);
            if (tiles.length > maxArea) {
                maxArea = tiles.length;
                maxAreaIndex = areaSizes.length - 1;
            }
        }
    }

    // connect smaller areas to the largest one
    var pathcost = function(x, y) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return  -1;
        if (map[x][y] === 'wall')                                      return   3;
        if (map[x][y] === 'corridor')                                  return 0.5;
        else                                                           return   1;
    };
    var pathheuristic = function(x, y) {
        return map[x][y] === maxAreaIndex ? 0 : 1;
    };
    var connected = [];
    for (var x = 1; x < width - 1; x++) for (var y = 1; y < width - 1; y++) {
        if (options && options.stairs && x === options.stairs.x && y === options.stairs.y ||
            typeof map[x][y] === 'number' && !connected[map[x][y]] && areaSizes[map[x][y]] > 4) {
            for (var node = rlt.astar(x, y, pathcost, pathheuristic, rlt.dir4); node.parent; node = node.parent) {
                if (map[node.x][node.y] === 'wall') {
                    map[node.x][node.y] = 'corridor';
                } else {
                    map[node.x][node.y] = 'floor';
                }
            }
            connected[map[x][y]] = true;
        }
    }

    // fill all the areas with floor
    for (var x = 1; x < width - 1; x++) for (var y = 1; y < height - 1; y++) {
        if (typeof map[x][y] === 'number') {
            if (areaSizes[map[x][y]] > 4) {
                map[x][y] = 'floor';
            } else {
                map[x][y] = 'wall';
            }
        }
    }

    //floodfill walls connected to edge
    var outer = rlt.astar(0, 0, arrCellIs.bind(null, map, 'wall'), noHeuristic, rlt.dir4);
    for (var i = 0; i < outer.length; i++) {
        map[outer[i].x][outer[i].y] = 'outerWall';
    }

    // randomly turn groups of walls into grass
    for (var i = 0; i < 100; i++) {
        var randx = rlt.random(2, width - 3);
        var randy = rlt.random(2, height - 3);
        if (map[randx][randy] === 'wall') {
            var grass = rlt.astar(randx, randy, arrCellIs.bind(null, map, 'wall'), noHeuristic, rlt.dir4);
            for (var j = 0; j < grass.length; j++) {
                map[grass[j].x][grass[j].y] = 'tallGrass';
            }
        }
    }

    // turn outerwalls back into walls
    for (var x = 0; x < width; x++) for (var y = 0; y < height; y++) {
        if (map[x][y] === 'outerWall') map[x][y] = 'wall';
    }

    // place stairs
    if (options.stairs) {
        map[options.stairs.x][options.stairs.y] = options.stairs.name;
    }

    return map;
};

game.decorateCave = function(cave) {
    'use strict';
    game.map = rlt.array2d(game.width, game.height, function(x, y) {
        return Object.create(game.tiles[cave[x][y]]);
    });
    var weights = rlt.normalize2d(game.weight());

};

/**
 * Takes an array of 0s and weights it based on number of tiles in fov
 * @return the array
 */
game.weight = function() {
    'use strict';
    var array = rlt.array2d(game.width, game.height, 0);
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
    return game.map[x][y].passable && !game.map[x][y].actor;
};

game.defaultCost = function(x, y) {
    'use strict';
    var tile = game.map[x][y];
    if (!tile.passable) {
        return -3;
    }
    return 1 + (tile.actor ? tile.actor.timeSpentStill : 0);
}

game.transparent = function(x, y) {
    'use strict';
    var tile = game.map[x][y];
    return tile.actor ? tile.actor.tile.transparent : tile.transparent;
};

game.visible = function(x, y) {
    'use strict';
    return game.map[x][y].visible;
};

game.cacheMapTile = function(tile, spritesheet, spriteWidth, spriteHeight) {
    'use strict';
    var canvas = document.createElement('canvas');
    canvas.width = spriteWidth;
    canvas.height = spriteHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(spritesheet, tile.spritex * spriteWidth, tile.spritey * spriteHeight, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = tile.color;
    ctx.fillRect(0, 0, spriteWidth, spriteHeight);
    tile.canvas = canvas;
};

game.cacheMapTiles = function(map, spritesheet, spriteWidth, spriteHeight) {
    'use strict';
    for (var x = 0; x < map.length; x++) {
        for (var y = 0; y < map[0].length; y++) {
            game.cacheMapTile(map[x][y], spritesheet, spriteWidth, spriteHeight);
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
