import * as Level from './level'
import * as Player from './player'
import { Entities } from './entity'

/** @file handles game creation, saving, and loading */

export interface Game {
    version: string
    seed: number
    schedule: number[]
    entities: Entities
    player: Player.Player
    level: Level.Level
}

const VERSION = '0.1.1'
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
    const entities = {nextId: 1}
    const player = Player.create(entities)
    schedule.unshift(player.id)
    const level = Level.create(seed, player)

    return {version, seed, schedule, entities, player, level}
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
