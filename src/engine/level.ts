import { HEIGHT, WIDTH } from '../data/constants';
import { TileName } from '../data/tile';
import * as Alea from '../lib/alea';
import * as Noise from '../lib/noise';
import { shadowcast } from './fov';
import { countGroups, floodfill, floodfillSet } from './position';
import { shuffle } from './random';
import { createGrid, inBounds, forEachPos, forEachInnerPos, surrounded } from './grid'
import { Grid } from '../types/game'

/** @file handles level generation and iteration */

export interface Level {
    tiles: Grid<TileName>;
    playerX: number;
    playerY: number;
}

/** create a new level */
export function create(seed: number, playerX: number, playerY: number): Level {
    const alea = Alea.seed(seed);
    const randSeed = Alea.random(alea);
    Noise.seed(randSeed);

    const tiles = createTiles();

    carveCaves();
    removeSmallWalls();
    const size = removeOtherCaves();
    if (size < WIDTH * HEIGHT / 4) {
        return create(randSeed, playerX, playerY);
    }
    fillSmallCaves();
    const visibility = generateVisibility();
    placeGrass();

    /**
     * return a dict of positions to tile types
     * all tiles are initially walls except for the player's position, which is a floor
     */
    function createTiles(): Grid<TileName> {
        return createGrid(WIDTH, HEIGHT, (x, y) => {
            if (x === playerX && y == playerY) {
                return 'floor'
            } else {
                return 'wall'
            }
        });
    }

    /** whether the tile at [pos] is a floor tile */
    function isFloor(x: number, y: number) {
        return tiles[y][x] === 'floor';
    }

    /** whether the tile at [pos] is passable */
    function passable(x: number, y: number) {
        return tiles[y][x] === 'floor';// || tiles[pos] === '.'SHALLOW_WATER
    }

    /** whether the tile at [pos] is a wall tile */
    function isWall(x: number, y: number) {
        return inBounds(WIDTH, HEIGHT, x, y) && tiles[y][y] === 'wall';
    }

    /** use an (almost) cellular automaton to generate caves */
    function carveCaves() {
        const innerPositions: Array<{x: number, y: number}> = [];
        forEachInnerPos(WIDTH, HEIGHT, (x, y) => innerPositions.push({x, y}));
        shuffle(Array.from(innerPositions), alea).forEach(({x, y}) => {
            if (isWall(x, y) && countGroups(pos, passable) !== 1) {
                tiles[y][x] = 'floor';
            }
        });
    }

    /** remove groups of 5 or fewer walls */
    function removeSmallWalls() {
        const visited = new Set();
        forEachInnerPos(WIDTH, HEIGHT, (x, y) => {
            const wallGroup = new Set();
            const floodable = (pos: number) => isWall(x, y) && !wallGroup.has(pos) && !visited.has(pos);
            const flood = (pos: number) => {
                visited.add(pos);
                wallGroup.add(pos);
            };
            floodfill(pos, floodable, flood);

            if (wallGroup.size < 6) {
                for (const pos of wallGroup) {
                    tiles[y][x] = 'floor';
                }
            }
        });
    }

    /** remove disconnected caves */
    function removeOtherCaves() {
        const mainCave = new Set();
        floodfillSet(playerPos, passable, mainCave);

        forEachInnerPos(WIDTH, HEIGHT, (x, y) => {
            if (tiles[y][x] === 'floor' && !mainCave.has(pos)) {
                tiles[y][x] = 'wall';
            }
        });

        return mainCave.size;
    }

    /** whether the tile at [pos] is part of a cave */
    function isCave(x: number, y: number) {
        return isFloor(x, y) && countGroups(pos, passable) === 1;
    }

    /** whether the tile at [pos] is not part of a cave */
    function isNotCave(x: number, y: number) {
        return isWall(x, y) || countGroups(pos, passable) !== 1;
    }

    /** whether the tile at [pos] is a dead end */
    function isDeadEnd(x: number, y: number) {
        return isFloor(x, y)
            && countGroups(pos, passable) === 1
            && surrounded(x, y, isNotCave);
    }

    /** recursively fill a dead end */
    function fillDeadEnd(x: number, y: number) {
        if (isDeadEnd(x, y)) {
            tiles[y][x] = 'wall';
            forEachNeighbor(pos, (neighbor) => {
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
        forEachInnerPos(WIDTH, HEIGHT, (x, y) => {
            fillDeadEnd(x, y);
            const cave = new Set();
            floodfillSet(pos, isCave, cave);

            if (cave.size === 2 || cave.size === 3) {
                tiles[y][x] = 'wall';
                for (const pos of cave) {
                    fillDeadEnd(x, y);
                }
            }
        });
    }

    /** Find the number of tiles visible from each tile */
    function generateVisibility() {
        const visibility: {[pos: number]: number} = {};
        forEachInnerPos(WIDTH, HEIGHT, (x, y) => {
            const fov = new Set();
            const transparent = (x: number, y: number) => tiles[y][x] === 'floor';
            const reveal = (pos: number) => fov.add(pos);
            if (transparent(x, y)) {
                shadowcast(pos, transparent, reveal);
            }
            visibility[pos] = fov.size;
        });
        return visibility;
    }

    function placeGrass() {
        forEachInnerPos(WIDTH, HEIGHT, (x, y) => {
            if (tiles[y][x] === 'wall') {
                return;
            }
            const z = 0 - x - y;
            const zoom = 10;
            // random simplex number between 0 and 2
            const noise = Noise.simplex3(x / zoom, y / zoom, z / zoom) + 1;
            if (visibility[pos] < 40 * noise) {
                tiles[y][x] = 'tallGrass';
            } else if (visibility[pos] < 60 * noise) {
                tiles[y][x] = 'shortGrass';
            }
        });
    }

    return {
        playerX,
        playerY,
        tiles,
    };
}
