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
    [ 1,-1],
    [ 0,-1],
    [-1,-1],
    [ 1, 0],
    [-1, 0],
    [ 1, 1],
    [ 0, 1],
    [-1, 1]
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

/**
 * Recursive shadowcasting algorithm.
 * This algorithm creates a field of view centered around (x, y).
 * Opaque tiles are treated as if they have beveled edges.
 * Transparent tiles are visible only if their center is visible, so the
 * algorithm is symmetric.
 * @param x - x coordinate of center
 * @param y - y coordinate of center
 * @param transparent - function that takes (x, y) as arguments and returns the transparency of that tile
 * @param reveal - callback function that reveals the tile at (x, y)
 */
rlt.shadowcast = function(x, y, transparent, reveal) {
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
            var realx = transform.xx * x + transform.xy * y;
            var realy = transform.yx * x + transform.yy * y;
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
    // Scan each octant
    for (var i = 0; i < 8; i++) {
        scan(1, 0, 1, transforms[i]);
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
            if (cost(x, y) < 0) {
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
 * @return whether or not a string color is transparent
 */
rlt._isTransparent = function(color) {
    'use strict';
    if (!color) return true;
    else if (color === 'transparent') return true;
    else return false;
};

rlt.Display = function(args) {
    'use strict';
    args = args || {};
    var display = {
        // width in tiles
        width: args.width || 80,
        // height in tiles
        height: args.height || 24,
        // CSS font specifier
        font: args.font || 'monospace',
        // parent HTML element
        parent: args.parent || document.body,
        // canvas HTML element
        canvas: args.canvas
    };
    // dimensions of a single tile
    var tile = rlt._measureFont(display.font, '@');
    display.tileWidth = tile.width;
    display.tileHeight = tile.height;
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
rlt.Display.prototype.draw = function(x, y, char, fg, bg) {
    'use strict';
    if (typeof fg === 'object') {
        fg = rlt.arr2rgb(fg);
    }
    if (typeof bg === 'object') {
        bg = rlt.arr2rgb(bg);
    }
    if (!rlt._isTransparent(bg)) {
        this.fillStyle = bg;
        this.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
    }
    if (!rlt._isTransparent(fg)) {
        this.ctx.fillText(char, x * this.tileWidth, y * this.tileHeight);
    }
};
