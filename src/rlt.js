/* jshint undef: true, shadow: true, strict: true */
/* globals document, Image */

var rlt = {};

/** An array of [x, y] arrays representing neighboring tiles in 4 directions */
rlt.dir4 = [
    [ 1, 0],
    [-1, 0],
    [ 0, 1],
    [ 0,-1]
];

/** An array of [x, y] arrays representing neighboring tiles in 8 directions */
rlt.dir8 = [
    [ 1, 0],
    [ 1,-1],
    [ 0,-1],
    [-1,-1],
    [-1, 0],
    [-1, 1],
    [ 0, 1],
    [ 1, 1]
];

/** An array of [x, y] arrays representing tiles in a 3x3 neighbourhood */
rlt.dir9 = [
    [ 1,-1],
    [ 0,-1],
    [-1,-1],
    [ 1, 0],
    [ 0, 0],
    [-1, 0],
    [ 1, 1],
    [ 0, 1],
    [-1, 1]
];

/** Clamp a number between a min and max */
rlt.clamp = function(n, min, max) {
	if (min !== undefined && n < min) return min;
	if (max !== undefined && n > max) return max;
	return n;
};

/**
 * Recursive shadowcasting algorithm.
 * This algorithm creates a field of view centered around (x, y).
 * Opaque tiles are treated as if they have beveled edges.
 * Transparent tiles are visible only if their center is visible, so the
 * algorithm is symmetric.
 * @param cx - x coordinate of center
 * @param cy - y coordinate of center
 * @param transparent - function that takes (x, y) as arguments and returns the transparency of that tile
 * @param reveal - callback function that reveals the tile at (x, y)
 */
rlt.shadowcast = function(cx, cy, transparent, reveal) {
    'use strict';
    /**
     * Scan one row of one octant.
     * @param y - distance from the row scanned to the center
     * @param start - starting slope
     * @param end - ending slope
     * @param transform - describes the transfrom to apply on x and y; determines the octant
     */
    var scan = function(y, start, end, transform) {
        if (start >= end) {
            return;
        }
        var xmin = Math.round((y - 0.5) * start);
        var xmax = Math.ceil((y + 0.5) * end - 0.5);
        for (var x = xmin; x <= xmax; x++) {
            var realx = cx + transform.xx * x + transform.xy * y;
            var realy = cy + transform.yx * x + transform.yy * y;
            if (transparent(realx, realy)) {
                if (x >= y * start && x <= y * end) {
                    reveal(realx, realy);
                }
            } else {
                if (x >= (y - 0.5) * start && x - 0.5 <= y * end) {
                    reveal(realx, realy);
                }
                scan(y + 1, start, (x - 0.5) / y, transform);
                start = (x + 0.5) / y;
                if (start >= end) {
                    return;
                }
            }
        }
        scan(y + 1, start, end, transform);
    };
    // An array of transforms, each corresponding to one octant.
    var transforms = [
        { xx:  1, xy:  0, yx:  0, yy:  1 },
        { xx:  1, xy:  0, yx:  0, yy: -1 },
        { xx: -1, xy:  0, yx:  0, yy:  1 },
        { xx: -1, xy:  0, yx:  0, yy: -1 },
        { xx:  0, xy:  1, yx:  1, yy:  0 },
        { xx:  0, xy:  1, yx: -1, yy:  0 },
        { xx:  0, xy: -1, yx:  1, yy:  0 },
        { xx:  0, xy: -1, yx: -1, yy:  0 }
    ];
    reveal(cx, cy);
    // Scan each octant
    for (var i = 0; i < 8; i++) {
        scan(1, 0, 1, transforms[i]);
    }
};

/**
 * Draw a line from (x0, y0) towards (x1, y1) as long as transparent() === true
 * @param x0 - x coordinate of initial point
 * @param y0 - y coordinate of initial point
 * @param x1 - x coordinate of final point
 * @param y1 - y coordinate of final point
 * @param transparent - function that returns whether or not to continue drawing
 * @param reveal - callback that is called for each point on the line with arguments (x, y)
 */
rlt.linecast = function(x0, y0, x1, y1, transparent, reveal) {
    'use strict';
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    if (dx === 0 && dy === 0) {
        reveal(x0, y0);
        return;
    }
    var sx = x1 > x0 ? 1 : -1;
    var sy = y1 > y0 ? 1 : -1;
    var error = dx - dy;
    while (true) {
        reveal(x0, y0);
        if (!transparent(x0, y0)) {
            break;
        }
        var error2 = 2 * error;
        if (error2 >= -dx) {
            error -= dy;
            x0 += sx;
        }
        if (error2 <= dx) {
            error += dx;
            y0 += sy;
        }
    }
};

/**
 * Implementation of DeltaClock
 * DeltaClock is a scheduling system created by Jeff Lund.
 * It is a linked list that stores actors and the time difference between them.
 * @return a new schedule object
 */
rlt.Schedule = function() {
    'use strict';
    return {
        /**
         * Add an actor to the schedule
         * @param actor - actor to be added
         * @param delta - the time before actor will act
         * @return the schedule
         */
        add: function(actor, delta) {
            var prev = this;
            var next = this.next;
            while (next && next.delta <= delta) {
                delta -= next.delta;
                prev = next;
                next = next.next;
            }
            if (next) {
                next.delta -= delta;
            }
            prev.next = {
                actor: actor,
                delta: delta,
                next: next
            };
            return this;
        },
        /**
         * Advance to the next actor
         * @return the actor that was at the head of the list
         */
        advance: function() {
            if (!this.next) {
                return undefined;
            }
            var actor = this.next.actor;
            this.next = this.next.next;
            return actor;
        },
        /**
         * Remove all instances of an actor
         * @param actor - the actor to be removed
         * @return the schedule
         */
         remove: function(actor) {
             var prev = this;
             var next = this.next;
             while (next) {
                 if (next.actor === actor) {
                     prev.next = next.next;
                     if (prev.next) {
                         prev.next.delta += next.delta;
                     }
                 } else {
                     prev = prev.next;
                 }
                 next = prev.next;
             }
             return this;
         },
         /** The head of the list */
         next: undefined
    };
};

/**
 * Load an image.
 * @param path - the image's path
 * @param callback - called once the image is loaded
 * @param width - (optional) width of the image
 * @param height - (optional) height of the image
 * @return the image object
 */
rlt.loadImg = function(path, callback, width, height) {
    'use strict';
    var img;
    if (typeof width === 'number' && typeof height === 'number') {
        img = new Image(width, height);
    } else {
        img = new Image();
    }
    img.addEventListener('load', callback);
    img.src = path;
    return img;
};

/**
 * Generate a random integer in [min, max]
 * @param min - minimum value
 * @param max - maximum value
 * @param prng - function that returns a random number in [0, 1), default Math.random
 * @return a random number in [min, max]
 */
rlt.random = function(min, max, prng) {
    'use strict';
    prng = prng || Math.random;
    return min + Math.floor((1+max-min) * prng());
};

/**
 * Shuffle an array with the Fischer-Yates shuffle.
 * @param array - the array to be shuffled
 * @param prng - function that returns a random number in [0, 1), default Math.random
 * @return the array
 */
rlt.shuffle = function(array, prng) {
    'use strict';
    prng = prng || Math.random;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(i * prng());
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

/**
 * Create an array of elements equal to their indeces.
 * @param length - length of the array
 * @return the array
 */
rlt.range = function(length) {
    'use strict';
    var array = [];
    for (var i = 0; i < length; i++) {
        array[i] = i;
    }
    return array;
};

/**
 * Binary seach of a sorted list for what index to insert the key in
 * @param array - the array to be searched
 * @param key - the value we are inserting
 * @return index of upper bound of interval
 */
rlt.binarySearchInterval = function(array, key) {
    'use strict';
    var min = 0;
    var max = array.length - 1;
    var guess = Math.floor((min + max) / 2);
    while (guess > min) {
        if (array[guess] < key) {
            min = guess;
            guess = Math.floor((guess + max) / 2);
        } else if (array[guess] > key) {
            max = guess;
            guess = Math.floor((min + guess) / 2);
        } else {
            return guess;
        }
    }
    if (key < array[guess]) {
        return 0;
    } else {
        return guess + 1;
    }
};

/**
 * Given an array of weights return a weighted random index
 * @param array - array where each element is proportional to chance of it being chosen
 * @param prng - function that returns a random number in [0, 1)
 * @param cumulative - whether or not the array is a cumulative distrivution function already
 * @return random index
 */
rlt.randomIndex = function(array, prng, cumulative) {
    'use strict';
    prng = prng || Math.random;
    if (!cumulative) {
        for (var i = 1; i < array.length; i++) {
            array[i] += array[i-1];
        }
    }
    var max = array[array.length-1];
    var rand = max * prng();
    return rlt.binarySearchInterval(array, rand);
};

/**
 * Create a 2d array
 * @param imax - length of the first array
 * @param jmax - length of the second arrays
 * @param fill - value of the elements of the second arrays
 * @return the array
 */
rlt.array2d = function(imax, jmax, fill) {
    'use strict';
    var array = [];
    for (var i = 0; i < imax; i++) {
        array[i] = [];
        for (var j = 0; j < jmax; j++) {
            if (typeof fill === 'function') {
                array[i][j] = fill(i, j);
            } else {
                array[i][j] = fill;
            }
        }
    }
    return array;
};

/**
 * Create an array of elements from 0 to length - 1 in random order.
 * Essesntially rlt.shuffle(rlt.range(length), prng) but faster
 * @param length - length of the array
 * @param prng - function that returns a random number in [0, 1), default Math.random
 * @return the array
 */
rlt.shuffledRange = function(length, prng) {
    'use strict';
    prng = prng || Math.random;
    var array = [];
    for (var i = 0; i < length; i++) {
        var j = Math.floor(i * prng());
        if (j !== i) {
            array[i] = array[j];
        }
        array[j] = i;
    }
    return array;
};

/**
 * Implementation of A* for square grids.
 * Instead of stopping at a goal, it stops when h = 0.
 * @param startx - the x coordinate of the origin
 * @param starty - the y coordinate of the origin
 * @param cost - the cost of moving to (x,y). If the cost is negative the tile is ignored
 * @param heuristic - the heuristic/expected cost until destination
 * @param directions - array of array of offests. Default rlt.dir8
 */
rlt.astar = function(startx, starty, cost, heuristic, directions) {
    'use strict';
    var directions = directions || rlt.dir8;

    var open = [{parent: undefined, x: startx, y: starty, f: 0, g: 0, h: 0}];
    var closed = [];
    while (open.length > 0) {
        // find the open tile with smallest f
        var iminf = 0;
        var minf = open[0].f;
        for (var i = 1; i < open.length; i++) {
            if (open[i].f < minf) {
                iminf = i;
                minf = open[i].f;
            }
        }
        // remove it from open
        var tile = open.splice(iminf, 1)[0];
        // for each neighboring tile
        for (var i = 0; i < directions.length; i++) {
            var x = tile.x + directions[i][0];
            var y = tile.y + directions[i][1];
            // don't consider tiles with negative cost
            if (cost(x, y) <= 0) {
                continue;
            }
            var newtile = {
                parent: tile,
                x: x,
                y: y,
                g: tile.g + cost(x, y),
                h: heuristic(x, y)
            };
            newtile.f = newtile.g + newtile.h;
            if (heuristic(x, y) <= 0) {
                return newtile;
            }
            // skip this tile if a better (smaller f) one with same position is in the open list
            var skip = false;
            for (var j = 0; j < open.length; j++) {
                if (open[j].x === newtile.x && open[j].y === newtile.y && open[j].f <= newtile.f) {
                    skip = true;
                }
            }
            // skip this tile if a better one with same position is in the closed list
            for (var j = 0; j < closed.length; j++) {
                if (closed[j].x === newtile.x && closed[j].y === newtile.y && closed[j].f <= newtile.f) {
                    skip = true;
                }
            }
            if (!skip) {
                open.push(newtile);
            }
        }
        closed.push(tile);
    }
    return closed;
};

/**
 * Measure the dimensions of a font's character (default @)
 * @param font - a CSS font string
 * @return object with width and height properties
 */
rlt._measureFont = function(font, char) {
    'use strict';
    char = char || '@';
    var div = document.createElement('div');
    div.innerHTML = char;
    div.style.position = 'absolute';
    div.style.font = font;
    document.body.appendChild(div);
    var width = div.offsetWidth;
    var height = div.offsetHeight;
    document.body.removeChild(div);
    return {
        width: width,
        height: height
    };
};

/**
 * Convert an array of [r,g,b] or [r,g,b,a] values to a CSS color string
 * @return CSS color string
 */
rlt.arr2rgb = function(array) {
    'use strict';
    if (array.length === 3) {
        return 'rgb(' + array[0] + ',' + array[1] + ',' + array[2] + ')';
    } else if (array.length === 4) {
        return 'rgba(' + array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3] + ')';
    } else {
        return '';
    }
};

/**
 * Convert an array of [h,s,l] or [h,s,l,a] values to a CSS color string
 * @return CSS color string
 */
rlt.arr2hsl = function(array) {
    'use strict';
    if (array.length === 3) {
        return 'hsl(' + array[0] + ',' + array[1] + '%,' + array[2] + '%)';
    } else if (array.length === 4) {
        return 'hsl(' + array[0] + ',' + array[1] + '%,' + array[2] + '%,' + array[3] + ')';
    } else {
        return '';
    }
};

/**
 * @return whether or not a string color is transparent
 */
rlt._isTransparent = function(color) {
    'use strict';
    if (!color) return true;
    else if (color === 'transparent') return true;
    else return false;
};

/**
 * Create a canvas display
 * All parameters are optional and are passed in an args object.
 * @param args.width - width in tiles, default 80
 * @param args.height - height in tiles, default 24
 * @param args.font - CSS font string, default 1em/1 monospace
 * @param args.canvas - canvas element, default a new canvas element
 * @param args.tileWidth - width of a tile, default depends on font
 * @param args.tileHeight - height of a tile, default depends on font
 * @return a new display object
 */
rlt.Display = function(args) {
    'use strict';
    args = args || {};
    var display = Object.create(rlt.Display.prototype);
    // width in tiles
    display.width = args.width || 80;
    // height in tiles
    display.height = args.height || 24;
    // CSS font specifier
    display.font = args.font || '1em/1 monospace';
    // canvas HTML element
    display.canvas = args.canvas;
    // dimensions of a single tile
    var tile = rlt._measureFont(display.font, '@');
    display.tileWidth = args.tileWidth || tile.width;
    display.tileHeight = args.tileHeight || tile.height;
    // default canvas
    if (!display.canvas) {
        var canvas = document.createElement('canvas');
        canvas.width = display.width * display.tileWidth;
        canvas.height = display.height * display.tileHeight;
        display.canvas = canvas;
    }
    // canvas context
    display.ctx = display.canvas.getContext('2d');
    display.ctx.font = display.font;
    display.ctx.textAlign = 'center';
    display.ctx.textBaseline = 'middle';
    return display;
};

/**
 * Draw a glyph
 * @param x - x coordinate in tiles
 * @param y - y coordinate in tiles
 * @param char - character to be drawn
 * @param fg - optional foregound color, default transparent
 * @param bg - optional foreground color, default transparent
 */
rlt.Display.prototype.draw = function(char, x, y, fg, bg) {
    'use strict';
    if (typeof fg === 'object') {
        fg = rlt.arr2rgb(fg);
    }
    if (typeof bg === 'object') {
        bg = rlt.arr2rgb(bg);
    }
    if (!rlt._isTransparent(bg)) {
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
    }
    if (!rlt._isTransparent(fg)) {
        this.ctx.fillStyle = fg;
        this.ctx.fillText(char, (x + 0.5) * this.tileWidth, (y + 0.5) * this.tileHeight);
    }
};

/**
 * Draw a cached image or canvas element
 * @param img - the image or canvas element
 * @param x - x coordinate in tiles
 * @param y - y coordinate in tiles
 */
rlt.Display.prototype.drawCached = function(img, x, y) {
    'use strict';
    this.ctx.drawImage(img, x * this.tileWidth, y * this.tileHeight);
};

/**
 * Draw a tile from a monochromatic bitmap in a certain color
 * @param img - spritesheet
 * @param sx - x coordinate of tile in spritesheet
 * @param sy - y coordinate of tile in spritesheet
 * @param swidth - width of a sprite in the spritesheet
 * @param sheight - height of a sprite in the spritesheet
 * @param dx - x coordinate of tile in display
 * @param dy - y coordinate of tile in display
 * @param color - color of the tile
 */
rlt.Display.prototype.drawBitmap = function(img, sx, sy, swidth, sheight, dx, dy, color, scale) {
    'use strict';
    var canvas = document.createElement('canvas');
    canvas.width = scale * swidth;
    canvas.height = scale * sheight;
    var ctx = canvas.getContext('2d');
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx * swidth, sy * sheight, swidth, sheight, 0, 0, canvas.width, canvas.height);
    if (color) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    this.ctx.drawImage(canvas, dx * this.tileWidth, dy * this.tileHeight);
};
