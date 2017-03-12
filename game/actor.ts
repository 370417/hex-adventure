import { Game } from './game'

const Behavior = {
    player(game) {
        return Infinity
    },
}

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

export function step(game: Game): number {
    const id = game.schedule[0]
    const entity = game.entities[id]
    return Behavior[entity.type](game)
}

function nextTurn(game: Game): void {
    const id = game.schedule.shift()
    game.schedule.push(id)
}

function expire(game: Game): void {
    game.schedule.shift()
}
