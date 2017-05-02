(function () {
'use strict';

const WIDTH = 48;
const HEIGHT = 31;
const dir1 = 1 - WIDTH;
const dir3 = 1;
const dir5 = WIDTH;
const dir7 = -1 + WIDTH;
const dir9 = -1;
const dir11 = -WIDTH;
const directions = [dir1, dir3, dir5, dir7, dir9, dir11];

/** @file constants related to visual style */
/** @file constants related to visual style */ const xu = 18;
const smallyu = 16;
const bigyu = 24;
const spriteNames = ['wall', 'floor', 'shortGrass', 'tallGrass', 'spikes', 'player'];
const color = {
    wall: 0xEEEEEE,
    floor: 0xFFFFFF,
    shortGrass: 0x008800,
    tallGrass: 0x008800,
    spikes: 0xEEEEEE,
    player: 0xFFFFFF,
};

/** @file helper functions for working with positions */
/** convert the coordinate pair [x], [y] into an integer position */
function xy2pos(x, y) {
    return x + y * WIDTH;
}
/** convert an integer [pos] into the coordinate pair x, y */
function pos2xy(pos) {
    return {
        x: pos % WIDTH,
        y: Math.floor(pos / WIDTH),
    };
}
/** return the distance between (x1, y1) and (x2, y2) */

/** return the distance between pos1 and pos2 */

/** return the number of contiguous groups of tiles around a [pos] that satisfy [ingroup] */
function countGroups(pos, ingroup) {
    // use var instead of let because
    // chrome can't optimize compound let assignment
    var groupcount = 0;
    for (let i = 0; i < 6; i++) {
        const curr = directions[i];
        const next = directions[(i + 1) % 6];
        if (!ingroup(pos + curr) && ingroup(pos + next)) {
            groupcount += 1;
        }
    }
    if (groupcount) {
        return groupcount;
    }
    else {
        return Number(ingroup(pos + dir1));
    }
}
/**
 * [flood] from [pos] as long as neighbors are [floodable]
 * it is up to [flood] to make sure that [floodable] returns false for visited positions
 */
function floodfill(pos, floodable, flood) {
    if (floodable(pos)) {
        flood(pos);
        for (let i = 0; i < 6; i++) {
            floodfill(pos + directions[i], floodable, flood);
        }
    }
}
/**
 * flood from [pos] as long as neighbors are [passable]
 * [visited] keeps track of what positions have already been flooded, and is normally set to empty
 */
function floodfillSet(pos, passable, visited) {
    if (passable(pos) && !visited.has(pos)) {
        visited.add(pos);
        forEachNeighbor(pos, neighbor => {
            floodfillSet(neighbor, passable, visited);
        });
    }
}
/** whether [istype] is true for all positions surrounding [pos] */
function surrounded(pos, istype) {
    for (let i = 0; i < 6; i++) {
        if (!istype(pos + directions[i])) {
            return false;
        }
    }
    return true;
}
/** calls [callback] for each position neighboring [pos] */
function forEachNeighbor(pos, callback) {
    for (let i = 0; i < 6; i++) {
        callback(pos + directions[i]);
    }
}

/** return a random integer in the range [min, max] inclusive */
function randint(min, max, random) {
    return min + Math.floor((max - min + 1) * random());
}
/** randomly shuffle an array in place */
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random);
        const tempi = array[i];
        array[i] = array[j];
        array[j] = tempi;
    }
    return array;
}

/** @file calculates fov */
const normals = [dir1, dir3, dir5, dir7, dir9, dir11];
const tangents = [dir5, dir7, dir9, dir11, dir1, dir3];
/**
 * calculate fov using recursive shadowcasting
 * @param center orgin of fov
 * @param transparent whether the tile at pos is transpaernt
 * @param reveal add pos to the fov
 */
function shadowcast(center, transparent, reveal) {
    reveal(center);
    for (let i = 0; i < 6; i++) {
        const transform = (x, y) => center + x * tangents[i] + y * normals[i];
        const transformedTransparent = (x, y) => transparent(transform(x, y));
        const transformedReveal = (x, y) => reveal(transform(x, y));
        scan(1, 0, 1, transformedTransparent, transformedReveal);
    }
}
/** round a number, rounding up if it ends in .5 */
function roundHigh(n) {
    return Math.round(n);
}
/** round a number, rounding down if it ends in .5 */
function roundLow(n) {
    return Math.ceil(n - 0.5);
}
/**
 * Calculate a 60 degree sector of fov by recursively scanning rows.
 * @param y Distance from center of fov to the row being scanned
 * @param start Slope of starting angle expressed as x / y
 * @param end Slope of ending angle expressed as x / y
 * @param transparent Whether the tile at (x, y) is transparent
 * @param reveal Add the tile at (x, y) to the fov
 */
function scan(y, start, end, transparent, reveal) {
    if (start >= end)
        return;
    // minimum and maximum x coordinates for opaque tiles
    // the fov for transparent tiles is slightly narrower to presernve symmetry
    const xmin = roundHigh(y * start);
    const xmax = roundLow(y * end);
    // whether the current continous fov has transparent tiles
    // this is used to prevent disjoint fov
    let fovExists = false;
    for (let x = xmin; x <= xmax; x++) {
        if (transparent(x, y)) {
            if (x >= y * start && x <= y * end) {
                reveal(x, y);
                fovExists = true;
            }
        }
        else {
            if (fovExists) {
                scan(y + 1, start, (x - 0.5) / y, transparent, reveal);
            }
            reveal(x, y);
            fovExists = false;
            start = (x + 0.5) / y;
            if (start >= end)
                return;
        }
    }
    if (fovExists) {
        scan(y + 1, start, end, transparent, reveal);
    }
}

// Port of alea.js to typescript
// From http://baagoe.com/en/RandomMusings/javascript/
// Johannes Baagøe <baagoe@baagoe.com>, 2010
// version 0.9
/** seed a new prng state */
function seed(...args) {
    const mash = Mash();
    let s0 = mash(' ');
    let s1 = mash(' ');
    let s2 = mash(' ');
    let c = 1;
    if (args.length === 0) {
        args = [Date.now()];
    }
    for (let i = 0; i < args.length; i++) {
        s0 -= mash(args[i]);
        if (s0 < 0) {
            s0 += 1;
        }
        s1 -= mash(args[i]);
        if (s1 < 0) {
            s1 += 1;
        }
        s2 -= mash(args[i]);
        if (s2 < 0) {
            s2 += 1;
        }
    }
    return { s0, s1, s2, c };
}
/** generate a random number between 0 and 1 */
function random(state) {
    const t = 2091639 * state.s0 + state.c * 2.3283064365386963e-10; // 2^-32
    state.s0 = state.s1;
    state.s1 = state.s2;
    return state.s2 = t - (state.c = t | 0);
}
function Mash() {
    let n = 0xefc8249d;
    return function mash(data) {
        data = data.toString();
        for (let i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
}

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */
class Grad {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    dot2(x, y) {
        return this.x * x + this.y * y;
    }
    dot3(x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    }
}
var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
var p = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
// To remove the need for index wrapping, double the permutation table length
var perm = new Array(512);
var gradP = new Array(512);
// This isn't a very good seeding function, but it works ok. It supports 2^16
// different seed values. Write something better if you need more seeds.
function seed$1(seed) {
    if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
    }
    seed = Math.floor(seed);
    if (seed < 256) {
        seed |= seed << 8;
    }
    for (var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
            v = p[i] ^ (seed & 255);
        }
        else {
            v = p[i] ^ ((seed >> 8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
}

seed$1(0);
var F3 = 1 / 3;
var G3 = 1 / 6;
// 2D simplex noise


// 3D simplex noise
function simplex3(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin + zin) * F3; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin - j + t;
    var z0 = zin - k + t;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
        else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
        else {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
    }
    else {
        if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        }
        else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        }
        else {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;
    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];
    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
        n0 = 0;
    }
    else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
        n1 = 0;
    }
    else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
        n2 = 0;
    }
    else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
        n3 = 0;
    }
    else {
        t3 *= t3;
        n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);
}

// 2D Perlin Noise


// 3D Perlin Noise

/** create a new level */
function create(seed$$1, playerPos) {
    const alea = seed(seed$$1);
    const random$$1 = () => random(alea);
    seed$1(random$$1());
    const tiles = createTiles();
    carveCaves();
    removeSmallWalls();
    const size = removeOtherCaves();
    if (size < WIDTH * HEIGHT / 4) {
        return create(seed$$1, playerPos);
    }
    fillSmallCaves();
    const visibility = generateVisibility();
    placeGrass();
    /**
     * return a dict of positions to tile types
     * all tiles are initially walls except for the player's position, which is a floor
     */
    function createTiles() {
        const types = {};
        forEachPos(pos => {
            types[pos] = 'wall';
        });
        types[playerPos] = 'floor';
        return types;
    }
    /** whether the tile at [pos] is a floor tile */
    function isFloor(pos) {
        return tiles[pos] === 'floor';
    }
    /** whether the tile at [pos] is passable */
    function passable(pos) {
        return tiles[pos] === 'floor'; // || tiles[pos] === '.'SHALLOW_WATER
    }
    /** whether the tile at [pos] is a wall tile */
    function isWall(pos) {
        return inBounds(pos) && tiles[pos] === 'wall';
    }
    /** use an (almost) cellular automaton to generate caves */
    function carveCaves() {
        const innerPositions = [];
        forEachInnerPos(pos => innerPositions.push(pos));
        shuffle(Array.from(innerPositions), random$$1).forEach(pos => {
            if (isWall(pos) && countGroups(pos, passable) !== 1) {
                tiles[pos] = 'floor';
            }
        });
    }
    /** remove groups of 5 or fewer walls */
    function removeSmallWalls() {
        const visited = new Set();
        forEachInnerPos(pos => {
            const wallGroup = new Set();
            const floodable = (pos) => isWall(pos) && !wallGroup.has(pos) && !visited.has(pos);
            const flood = (pos) => {
                visited.add(pos);
                wallGroup.add(pos);
            };
            floodfill(pos, floodable, flood);
            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    tiles[pos] = 'floor';
                }
            }
        });
    }
    /** remove disconnected caves */
    function removeOtherCaves() {
        const mainCave = new Set();
        floodfillSet(playerPos, passable, mainCave);
        forEachInnerPos(pos => {
            if (tiles[pos] === 'floor' && !mainCave.has(pos)) {
                tiles[pos] = 'wall';
            }
        });
        return mainCave.size;
    }
    /** whether the tile at [pos] is part of a cave */
    function isCave(pos) {
        return isFloor(pos) && countGroups(pos, passable) === 1;
    }
    /** whether the tile at [pos] is not part of a cave */
    function isNotCave(pos) {
        return isWall(pos) || countGroups(pos, passable) !== 1;
    }
    /** whether the tile at [pos] is a dead end */
    function isDeadEnd(pos) {
        return isFloor(pos)
            && countGroups(pos, passable) === 1
            && surrounded(pos, isNotCave);
    }
    /** recursively fill a dead end */
    function fillDeadEnd(pos) {
        if (isDeadEnd(pos)) {
            tiles[pos] = 'wall';
            forEachNeighbor(pos, neighbor => {
                if (pos === playerPos && passable(neighbor)) {
                    playerPos = neighbor;
                }
                fillDeadEnd(neighbor);
            });
        }
    }
    /** remove 2-3 tile caves that are connected to the main cave */
    function fillSmallCaves() {
        // can't skip visited tiles here because previous caves can be affected
        // by the removal of later ones
        forEachInnerPos(pos => {
            fillDeadEnd(pos);
            const cave = new Set();
            floodfillSet(pos, isCave, cave);
            if (cave.size === 2 || cave.size === 3) {
                tiles[pos] = 'wall';
                for (const pos of cave) {
                    fillDeadEnd(pos);
                }
            }
        });
    }
    /** Find the number of tiles visible from each tile */
    function generateVisibility() {
        const visibility = {};
        forEachInnerPos(pos => {
            let fov = new Set();
            const transparent = (pos) => tiles[pos] === 'floor';
            const reveal = (pos) => fov.add(pos);
            if (transparent(pos)) {
                shadowcast(pos, transparent, reveal);
            }
            visibility[pos] = fov.size;
        });
        return visibility;
    }
    function placeGrass() {
        forEachInnerPos((pos, x, y) => {
            if (tiles[pos] === 'wall') {
                return;
            }
            const z = 0 - x - y;
            const zoom = 10;
            // random simplex number between 0 and 2
            const noise = simplex3(x / zoom, y / zoom, z / zoom) + 1;
            if (visibility[pos] < 40 * noise) {
                tiles[pos] = 'tallGrass';
            }
            else if (visibility[pos] < 60 * noise) {
                tiles[pos] = 'shortGrass';
            }
        });
    }
    return {
        tiles,
        playerPos,
    };
}
/** return the minimum x coordinate for a given [y], inclusive */
function xmin(y) {
    return Math.floor((HEIGHT - y) / 2);
}
/** return the maximum x coordinate for a given [y], exclusive */
function xmax(y) {
    return WIDTH - Math.floor(y / 2);
}
/** whether [pos] is inside the level */
function inBounds(pos) {
    const { x, y } = pos2xy(pos);
    return y >= 0 && y < HEIGHT && x >= xmin(y) && x < xmax(y);
}
/** call [fun] for each position in the level */
function forEachPos(fun) {
    for (let y = 0; y < HEIGHT; y++) {
        const min = xmin(y);
        const max = xmax(y);
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}
/** call [fun] for each position in the level except the outer edge */
function forEachInnerPos(fun) {
    for (let y = 1; y < HEIGHT - 1; y++) {
        const min = xmin(y) + 1;
        const max = xmax(y) - 1;
        for (let x = min; x < max; x++) {
            fun(xy2pos(x, y), x, y);
        }
    }
}

const VERSION = '0.1.3';
const SAVE_NAME = 'hex adventure';
class Game {
    constructor() {
        this.state = load() || create$1(Date.now());
        if (this.state.version !== VERSION) {
            console.warn('Save game is out of date');
        }
        console.log('Seed:', this.state.seed);
    }
    getPlayer() {
        return this.state.player;
    }
    getPosition(entity) {
        return this.state.components.position[entity];
    }
    setPosition(entity, position) {
        this.state.components.position[entity] = position;
    }
    offsetPosition(entity, delta) {
        this.state.components.position[entity] += delta;
    }
    getVelocity(entity) {
        return this.state.components.velocity[entity];
    }
    setVelocity(entity, velocity) {
        this.state.components.velocity[entity] = velocity;
    }
    getBehavior(entity) {
        return this.state.components.behavior[entity];
    }
    setBehavior(entity, behavior) {
        this.state.components.behavior[entity] = behavior;
    }
    getTile(position) {
        return this.state.level.tiles[position];
    }
    setTile(position, tile) {
        this.state.level.tiles[position] = tile;
    }
    getGrassDelay(position) {
        return this.state.level.grassDelay[position];
    }
    setGrassDelay(position, delay) {
        this.state.level.grassDelay[position] = delay;
    }
    getMob(position) {
        return this.state.level.mobs[position];
    }
    getMobType(entity) {
        return this.state.components.behavior[entity];
    }
    removeMob(position) {
        this.state.level.mobs[position] = undefined;
    }
    setMob(position, entity) {
        this.state.level.mobs[position] = entity;
    }
    getFov(position) {
        return this.state.fov[position];
    }
    clearFov() {
        for (let strPos in this.state.fov) {
            const pos = Number(strPos);
            this.setMemory(pos, this.state.level.tiles[pos]);
        }
        this.state.fov = {};
    }
    addFov(position) {
        this.state.fov[position] = true;
    }
    getMemory(position) {
        return this.state.memory[position];
    }
    setMemory(position, tile) {
        this.state.memory[position] = tile;
    }
    createEntity() {
        return this.state.nextEntity++;
    }
    /** add a new entity in the schedule before the current actor */
    schedule(entity) {
        this.state.schedule.unshift(entity);
    }
    /** end current actor's turn and setup its next turn */
    reschedule() {
        const entity = this.state.schedule.shift();
        this.state.schedule.push(entity);
    }
    /** end current actor's turn and remove it from the schedule */
    unschedule() {
        this.state.schedule.shift();
    }
    getCurrentEntity() {
        return this.state.schedule[0];
    }
    save() {
        localStorage[SAVE_NAME] = JSON.stringify(this.state);
    }
    random() {
        return random(this.state.alea);
    }
}
/** create a new game */
function create$1(seed$$1) {
    const center = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2));
    const level = create(seed$$1, center);
    return {
        version: VERSION,
        seed: seed$$1,
        schedule: [1, 2],
        components: {
            position: {
                '1': level.playerPos,
            },
            behavior: {
                '1': 'player',
                '2': 'environment',
            },
            velocity: {},
        },
        nextEntity: 3,
        player: 1,
        fov: {},
        memory: {},
        level: {
            tiles: level.tiles,
            mobs: {
                [level.playerPos]: 1,
            },
            grassDelay: {},
        },
        alea: seed(seed$$1),
    };
}
/** load the saved game if it exists */
function load() {
    const saveFile = localStorage[SAVE_NAME];
    return saveFile && JSON.parse(saveFile);
}

/** @file constants for map tiles */
const transparency = {
    wall: 0,
    floor: 2,
    shortGrass: 2,
    tallGrass: 1,
    spikes: 2,
};
const canWalk = {
    wall: false,
    floor: true,
    shortGrass: true,
    tallGrass: true,
    spikes: false,
};

/** @file manipulates entities that can be represented on the map */
/** move the entity */
function move$1(game, entity, direction) {
    game.removeMob(game.getPosition(entity));
    game.offsetPosition(entity, direction);
    game.setMob(game.getPosition(entity), entity);
}
const onWalk = {
    tallGrass: (game, pos, entity, direction) => {
        game.setTile(pos, 'shortGrass');
        game.setGrassDelay(pos, randint(3, 5, game.random.bind(game)));
    }
};
/** move the entity if possible */
function walk(game, entity, direction) {
    const targetPos = game.getPosition(entity) + direction;
    const targetTile = game.getTile(targetPos);
    if (canWalk[game.getTile(targetPos)]) {
        move$1(game, entity, direction);
        if (onWalk[targetTile]) {
            onWalk[targetTile](game, targetPos, entity, direction);
        }
    }
}

/** @file manipulates the player character */
/** move the player */
function move$$1(game, player, direction) {
    walk(game, player, direction);
    look(game, player);
    game.reschedule();
}
function look(game, self) {
    game.clearFov();
    shadowcast(game.getPosition(self), pos => transparency[game.getTile(pos)] > 0, pos => game.setMemory(pos, game.getTile(pos)));
    shadowcast(game.getPosition(self), pos => transparency[game.getTile(pos)] === 2, pos => game.addFov(pos));
}
function magic(game, player) {
    game.reschedule();
    const spike = game.createEntity();
    game.schedule(spike);
    game.setPosition(spike, game.getPosition(player) + 1);
    game.setVelocity(spike, 1);
    game.setBehavior(spike, 'spike');
}

const behaviors = {
    player: (game, self) => {
        // initialize fov if uninitiazlied
        if (!game.getFov(game.getPosition(self))) {
            look(game, self);
        }
        return Infinity;
    },
    snake: (game, self) => {
        game.reschedule();
        return 0;
    },
    environment: (game, self) => {
        forEachPos(pos => {
            const grassDelay = game.getGrassDelay(pos);
            if (game.getTile(pos) === 'shortGrass' && grassDelay !== undefined) {
                game.setGrassDelay(pos, grassDelay - 1);
                if (!game.getGrassDelay(pos)) {
                    game.setGrassDelay(pos, undefined);
                    game.setTile(pos, 'tallGrass');
                }
            }
        });
        game.reschedule();
        return 0;
    },
    spike: (game, self) => {
        const pos = game.getPosition(self);
        if (canWalk[game.getTile(pos)]) {
            game.setTile(pos, 'spikes');
            game.offsetPosition(self, game.getVelocity(self));
            look(game, game.getPlayer());
        }
        else {
            game.unschedule();
        }
        return 6;
    }
};
function step(game) {
    const entity = game.getCurrentEntity();
    const behavior = game.getBehavior(entity);
    return behaviors[behavior](game, entity);
}

/** @file handles input */
const movement = {
    KeyE: dir1,
    KeyD: dir3,
    KeyX: dir5,
    KeyZ: dir7,
    KeyA: dir9,
    KeyW: dir11,
};
function keydown(game, e) {
    game.skip();
    const direction = movement[e.code];
    if (direction) {
        move$$1(game, game.getPlayer(), direction);
        game.loop();
    }
    if (e.code === 'Digit1') {
        magic(game, game.getPlayer());
        game.loop();
    }
}

///<reference path="../lib/pixi.js.d.ts"/>
/** @file handles displaying the game and the game loop */
const root = document.getElementById('game');
const canvasWidth = (WIDTH - HEIGHT / 2 + 1) * xu;
const canvasHeight = (HEIGHT - 1) * smallyu + bigyu;
class Display extends Game {
    constructor() {
        super();
        this.app = new PIXI.Application({
            width: canvasWidth,
            height: canvasHeight,
        });
        root.appendChild(this.app.view);
        for (let i = 0; i < spriteNames.length; i++) {
            PIXI.loader.add(spriteNames[i], `${spriteNames[i]}.png`);
        }
        PIXI.loader.load(this.init.bind(this));
    }
    init(loader, resources) {
        this.textures = createTextureCache(resources);
        this.app.stage.addChild(this.createTiles());
        this.app.stage.addChild(this.createMobs());
        this.loop();
        window.addEventListener('keydown', keydown.bind(window, this), false);
    }
    createTiles() {
        const container = new PIXI.Container();
        this.tiles = {};
        forEachPos((pos, x, y) => {
            const tileName = this.getTile(pos);
            const sprite = new PIXI.Sprite(this.textures[tileName]);
            const { left, top } = calcOffset(x, y);
            sprite.x = left;
            sprite.y = top;
            sprite.visible = false;
            const memory = this.getMemory(pos);
            if (this.getFov(pos)) {
                sprite.visible = true;
                sprite.tint = color[tileName];
            }
            else if (memory) {
                sprite.visible = true;
                sprite.alpha = 0.5;
                sprite.texture = this.textures[memory];
                sprite.tint = color[memory];
            }
            container.addChild(sprite);
            this.tiles[pos] = sprite;
        });
        return container;
    }
    createMobs() {
        const container = new PIXI.Container;
        const sprite = new PIXI.Sprite(this.textures.player);
        const pos = this.getPosition(this.getPlayer());
        const { x, y } = pos2xy(pos);
        const { left, top } = calcOffset(x, y);
        sprite.x = left;
        sprite.y = top;
        container.addChild(sprite);
        this.mobs = {
            [pos]: sprite
        };
        return container;
    }
    addFov(position) {
        super.addFov(position);
        const tile = this.getTile(position);
        const sprite = this.tiles[position];
        sprite.visible = true;
        sprite.texture = this.textures[tile];
        sprite.tint = color[tile];
        sprite.alpha = 1;
    }
    clearFov() {
        super.clearFov();
    }
    setTile(position, tile) {
        super.setTile(position, tile);
        const sprite = this.tiles[position];
        sprite.texture = this.textures[tile];
        sprite.tint = color[tile];
    }
    setMemory(position, tile) {
        super.setMemory(position, tile);
        const sprite = this.tiles[position];
        sprite.texture = this.textures[tile];
        sprite.tint = color[tile];
        sprite.alpha = 0.5;
        sprite.visible = true;
    }
    setPosition(entity, position) {
        super.setPosition(entity, position);
    }
    offsetPosition(entity, delta) {
        const pos = this.getPosition(entity);
        super.offsetPosition(entity, delta);
        const sprite = this.mobs[pos];
        if (sprite) {
            this.mobs[pos] = undefined;
            const { x, y } = pos2xy(pos + delta);
            const { left, top } = calcOffset(x, y);
            sprite.x = left;
            sprite.y = top;
            this.mobs[pos + delta] = sprite;
        }
    }
    loop() {
        let delay = 0;
        while (!delay || this.skipAnimation && delay < Infinity) {
            delay = step(this);
        }
        this.app.render();
        if (delay === Infinity) {
            this.skipAnimation = false;
            this.save();
        }
        else {
            this.defer(delay);
        }
    }
    /** call loop after waiting a certain number of frames */
    defer(frames) {
        if (frames) {
            this.delayId = requestAnimationFrame(this.defer.bind(this, frames - 1));
        }
        else {
            this.loop();
        }
    }
    skip() {
        if (this.delayId === undefined)
            return;
        this.skipAnimation = false;
        cancelAnimationFrame(this.delayId);
        this.loop();
    }
}
function createTextureCache(resources) {
    let cache = {};
    spriteNames.forEach(name => {
        cache[name] = resources[name].texture;
    });
    return cache;
}
function calcOffset(x, y) {
    return {
        left: (x - (HEIGHT - y - 1) / 2) * xu,
        top: y * smallyu,
    };
}

/** @file entry point */
new Display();

}());
