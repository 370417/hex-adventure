import { Game } from './game'
import { Entity } from './entity'

/** @file handles actor behavior and scheduling (turn order) */

/** dict of actor behaviors */
export const Behavior: {[type: string]: (entity: Entity, game: Game) => number} = {}

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

/** advance gamestate by an atomic step */
export function step(game: Game) {
    const id = game.schedule[0]
    const entity = game.entities[id]
    return Behavior[entity.type](entity, game)
}

/** end current actor's turn and setup its next turn */
function reschedule(game: Game) {
    const id = game.schedule.shift()
    game.schedule.push(id)
}

/** end current actor's turn and remove it from the schedule */
function unschedule(game: Game) {
    game.schedule.shift()
}
