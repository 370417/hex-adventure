import { Game } from './game'

/// handles actor behavior and scheduling (turn order)

/// dict of actor behaviors
const Behavior: {[actorType: string]: (game: Game) => number} = {
    player(game) {
        return Infinity
    },
}

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

/// advance [game]state by an atomic step
export function step(game: Game): number {
    const id = game.schedule[0]
    const entity = game.entities[id]
    return Behavior[entity.type](game)
}

/// end current actor's turn and setup its next turn
function reschedule(game: Game): void {
    const id = game.schedule.shift()
    game.schedule.push(id)
}

/// end current actor's turn and remove it from the schedule
function unschedule(game: Game): void {
    game.schedule.shift()
}
