import { createEntity } from './entity'
import { createLevel, HEIGHT, WIDTH } from './level'
import { xy2pos } from './position'

/// handles game creation, saving, and loading

const VERSION = '0.1.0'
const SAVE_NAME = 'hex adventure'

/// load save game if it exists, otherwise create a new game
export function getGame() {
    let game = load() || create(Date.now())
    if (game.version !== VERSION) {
        console.warn('Save game is out of date')
    }
    console.log('Seed:', game.seed)
    window.game = game
    return game
}

function create(seed) {
    const version = VERSION
    const schedule = []
    const entities = {nextId: 1}
    const player = createEntity(entities)
    player.fov = {}
    player.pos = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2))
    player.type = 'player'
    schedule.unshift(player.id)
    const level = createLevel(seed, player)

    return {version, seed, schedule, entities, player, level}
}

export function save(game) {
    localStorage[SAVE_NAME] = JSON.stringify(game)
}

function load() {
    const saveFile = localStorage[SAVE_NAME]
    return saveFile && JSON.parse(saveFile)
}

function deleteSave() {
    localStorage.removeItem(SAVE_NAME)
}
