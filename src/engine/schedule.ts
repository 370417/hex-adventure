import { Game } from './game'
import { Entity } from './entity'

/** @file handles actor behavior and scheduling (turn order) */

/** dict of actor behaviors */
export const Behavior: {[type: string]: (game: Game, entity: Entity) => number} = {}

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

/** advance gamestate by an atomic step */
export function step(game: Game) {
    const id = game.schedule[0]
    const entity = game.entities[id]
    return Behavior[entity.type](game, entity)
}

/** end current actor's turn and setup its next turn */
export function reschedule(game: Game) {
    const id = game.schedule.shift()
    game.schedule.push(id)
}

/** end current actor's turn and remove it from the schedule */
export function unschedule(game: Game) {
    game.schedule.shift()
}
