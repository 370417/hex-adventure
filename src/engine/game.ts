import { HEIGHT, WIDTH } from '../data/constants';
import { TileName } from '../data/tile';
import * as Alea from '../lib/alea';
import { Behavior } from './behavior';
import * as Level from './level';
import { xy2pos } from './position';

/** @file handles game creation, saving, and loading */

interface NumDict<T> {
    [key: number]: T;
}

interface Entity  {
    pos: number;
    behavior: Behavior;
    velocity: number;
}

interface Tile {
    tiles: TileName;
    mobs: number;
    grassDelay: number;
}

export interface Game {
    version: string;
    seed: number;
    schedule: number[];
    prop: {
        [Component in keyof Entity]: NumDict<Entity[Component]>
    };
    nextEntity: number;
    player: number;
    fov: NumDict<boolean>;
    memory: NumDict<TileName>;
    level: {
        [Prop in keyof Tile]: {[pos: number]: Tile[Prop]}
    };
    alea: Alea.RandState;
}

const VERSION = '0.1.3';
const SAVE_NAME = 'hex adventure';

export function forceNew(seed: number): Game {
    const game = create(seed);
    return game;
}

export function get(): Game {
    const game = load() || create(Date.now());
    if (game.version !== VERSION) {
        console.warn('Save game is out of date');
    }
    console.log('Seed:', game.seed);
    return game;
}

export function save(game: Game) {
    localStorage[SAVE_NAME] = JSON.stringify(game);
}

/** create a new game */
function create(seed: number): Game {
    const center = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2));
    const level = Level.create(seed, center);
    return {
        alea: Alea.seed(seed),
        fov: {},
        level: {
            grassDelay: {},
            mobs: {
                [level.playerPos]: 1,
            },
            tiles: level.tiles,
        },
        memory: {},
        nextEntity: 3,
        player: 1,
        prop: {
            behavior: {
                1: 'player',
                2: 'environment',
            },
            pos: {
                1: level.playerPos,
            },
            velocity: {},
        },
        schedule: [1, 2],
        seed,
        version: VERSION,
    };
}

/** load the saved game if it exists */
function load(): Game {
    const saveFile = localStorage[SAVE_NAME];
    return saveFile && JSON.parse(saveFile);
}
