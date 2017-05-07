import { TileName } from '../data/tile'
import { WIDTH, HEIGHT } from '../data/constants'

import { xy2pos } from './position'
import { Behavior } from './behavior'
import * as Level from './level'

import * as Alea from '../lib/alea'

/** @file handles game creation, saving, and loading */

interface NumDict<T> {
    [key: number]: T
}

interface Entity  {
    pos: number
    behavior: Behavior
    velocity: number
}

interface Tile {
    tiles: TileName,
    mobs: number,
    grassDelay: number,
}

export interface Game {
    version: string
    seed: number
    schedule: number[]
    prop: {
        [Component in keyof Entity]: NumDict<Entity[Component]>
    }
    nextEntity: number
    player: number
    fov: NumDict<boolean>
    memory: NumDict<TileName>
    level: {
        [Prop in keyof Tile]: {[pos: number]: Tile[Prop]}
    }
    alea: Alea.RandState
}

const VERSION = '0.1.3'
const SAVE_NAME = 'hex adventure'

export function get(): Game {
    const game = load() || create(Date.now())
    if (game.version !== VERSION) {
        console.warn('Save game is out of date');
    }
    console.log('Seed:', game.seed)
    return game
}

export function save(game: Game) {
    localStorage[SAVE_NAME] = JSON.stringify(game)
}

/** create a new game */
function create(seed: number): Game {
    const center = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2))
    const level = Level.create(seed, center)
    return {
        version: VERSION,
        seed,
        schedule: [1, 2],
        prop: {
            pos: {
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
        alea: Alea.seed(seed),
    }
}

/** load the saved game if it exists */
function load(): Game {
    const saveFile = localStorage[SAVE_NAME]
    return saveFile && JSON.parse(saveFile)
}
