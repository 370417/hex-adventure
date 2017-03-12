import { Entity, Entities, createEntity } from './entity'
import { Level, createLevel } from './level'

export interface Game {
    version: string,
    seed: number,
    schedule: Array<number>,
    entities: {
        nextId: number,
        [id: number]: Entity,
    },
    player: Entity,
    level: Level,
}

const version = '0.1.0'
const SAVE_NAME = 'hex adventure'

// load save game if it exists, otherwise create a new game
export function getGame(): Game {
    let game = load() || create(Date.now())
    if (game.version !== version) {
        console.warn('Save game is out of date')
    }
    console.log('Seed:', game.seed)
    return game
}

function create(seed:number): Game {
    const schedule = []
    const entities = {nextId: 1}
    const player = createEntity(entities)
    player.pos = 234
    player.type = 'player'
    schedule.unshift(player.id)
    const level = createLevel(seed, player)

    return {version, seed, schedule, entities, player, level}
}

export function save(game: Game): void {
    localStorage[SAVE_NAME] = JSON.stringify(game)
}

function load(): Game | void {
    const saveFile = localStorage[SAVE_NAME]
    return saveFile && JSON.parse(saveFile)
}

function reset(): void {
    localStorage.removeItem(SAVE_NAME)
}
