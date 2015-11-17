/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, document, console, alert */

try {

// namespace
var game = {};

game.Tiles = {
    wall: {
        transparent: false,
        passable: false,
        color: '#aaa',
        name: 'wall',
        char: '#',
        spritex: 2,
        spritey: 3
    },
    floor: {
        transparent: true,
        passable: true,
        color: '#bbb',
        name: 'floor',
        char: '.',
        spritex: 2,
        spritey: 14
    },
    corridor: {
        transparent: true,
        passable: true,
        color: '#bbb',
        name: 'floor',
        char: '.',
        spritex: 2,
        spritey: 14
    }
};

/**
 * Create a canvas for each tile containing a chached glyph
 */
game.cacheTiles = function(spritesheet, spriteWidth, spriteHeight, scale) {
    'use strict';
    for (var tile in game.Tiles) {
        if (game.Tiles.hasOwnProperty(tile)) {
            tile = game.Tiles[tile];
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

var spritesheet;
rlt.loadImg('terminal8x8_aa_as.png', function() {
    'use strict';
    spritesheet = this;
    game.cacheTiles(spritesheet, 8, 8, 2);
}, 128, 128);

var height = 24;
var width = 40;
var arr = [];
for (var x = 0; x < width; x++) {
    arr[x] = [];
    for (var y = 0; y < height; y++) {
        arr[x][y] = 0;
    }
}
var indeces = rlt.shuffle(rlt.range((width-2) * (height-2)), Math.random);

// isolated by walls
var isolated = function(x, y) {
    'use strict';
    for (var i = 0; i < 8; i++) {
        if (arr[x + rlt.dir8[i][0]][y + rlt.dir8[i][1]] === 1) {
            return false;
        }
    }
    return true;
};

//isolated in 4 directions by floor
var isolated4 = function(x, y) {
    'use strict';
    for (var i = 0; i < 4; i++) {
        if (arr[x + rlt.dir4[i][0]][y + rlt.dir4[i][1]] === 0) {
            return false;
        }
    }
    return true;
};

// count number of goups of walls surrounding x, y
var wallGroups = function(x, y) {
    'use strict';
    var count = 0;
    var prev = arr[x + rlt.dir8[7][0]][y + rlt.dir8[7][1]];
    for (var i = 0; i < 8; i++) {
        var next = arr[x + rlt.dir8[i][0]][y + rlt.dir8[i][1]];
        if (prev === 0 && next === 1) {
            count++;
        }
    }
    // surrounded by the same type
    if (count === 0 && arr[x+1][y] === 0) {
        count = 1;
    }
    return count;
};

for (var i = 0; i < (width-2) * (height-2); i++) {
    var j = indeces[i];
    var x = 1 + Math.floor(j / (height-2));
    var y = 1 + j - (x-1) * (height-2);
    if (isolated(x, y)) {
        arr[x][y] = +(Math.random() < 0.4);
    } else {
        var groups = wallGroups(x, y);
        if (groups === 0) {
            arr[x][y] = 1;
        } else if (groups === 1) {
            arr[x][y] = +(Math.random() < 0.4);
        } else {
            arr[x][y] = 1;
        }
    }
}

var removelater = [];
// postprocessing to get rid of some diagonal gaps
for (var x = 1; x < width - 1; x++) {
    for (var y = 1; y < height - 1; y++) {
        if (arr[x][y] === 0 && isolated4(x, y)) {
            removelater.push(x);
            removelater.push(y);
        }
    }
}
for (var i = 0; i < removelater.length - 1; i += 2) {
    arr[removelater[i]][removelater[i+1]] = 1;
}

var d = rlt.Display({
    width: width,
    height: height,
    font: '16px/1.2 Monaco, monospace',
    tileWidth: 16,
    tileHeight: 16
});
document.body.appendChild(d.canvas);

console.log('^_^');

} catch (e) {
    console.log(e);
}
