import * as Level from './level'
import * as Player from './player'
import { Components } from './components'

import * as Alea from '../lib/alea'

/** @file handles game creation, saving, and loading */

export interface Game {
    version: string
    seed: number
    schedule: number[]
    components: Components
    nextEntity: number
    player: number
    level: Level.Level
    alea: Alea.RandState
}

const VERSION = '0.1.2'
const SAVE_NAME = 'hex adventure'

/** load save game if it exists, otherwise create a new game */
export function getGame() {
    let game = load() || create(Date.now())
    if (game.version !== VERSION) {
        console.warn('Save game is out of date')
    }
    console.log('Seed:', game.seed)
    return game
}

/** create a new game */
function create(seed: number): Game {
    const version = VERSION
    const schedule: number[] = []
    const components = {
        position: {},
        behavior: {},
        fov: {},
        memory: {},
    }
    const nextEntity = 1
    const player = 1
    Player.create(player, components)
    schedule.unshift(player)
    const level = Level.create(seed, player, components)
    const alea = Alea.seed(seed)

    return {version, seed, schedule, components, nextEntity, player, level, alea}
}

/** save a game */
export function save(game: Game) {
    localStorage[SAVE_NAME] = JSON.stringify(game)
}

/** load the saved game if it exists */
function load() {
    const saveFile = localStorage[SAVE_NAME]
    return saveFile && JSON.parse(saveFile)
}

/** delete the current savefile */
// function deleteSave() {
//     localStorage.removeItem(SAVE_NAME)
// }
