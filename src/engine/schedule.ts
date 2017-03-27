import { Game } from './game'
import { behaviors, Behavior } from './behavior'

/** @file handles actor behavior and scheduling (turn order) */

/** advance gamestate by an atomic step */
export function step(game: Game) {
    const entity = game.schedule[0]
    const behavior = game.components.behavior[entity]
    return behaviors[behavior](game, entity)
}

/** end current actor's turn and setup its next turn */
export function reschedule(game: Game) {
    const entity = game.schedule.shift()
    game.schedule.push(entity)
}

/** end current actor's turn and remove it from the schedule */
export function unschedule(game: Game) {
    game.schedule.shift()
}
