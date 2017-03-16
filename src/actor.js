import { fov } from './fov'

/** @file handles actor behavior and scheduling (turn order) */

/** dict of actor behaviors */
const Behavior = {
    player(self, game) {
        function transparent(pos) {
            return game.level.types[pos] === 'floor'
        }
        function reveal(pos) {
            self.fov[pos] = true
        }
        fov(self.pos, transparent, reveal)
        return Infinity
    },
}

// function create(game, behavior) {
//     const actor = Entity.create(game)
//     actor.behavior = behavior
//     return actor
// }

/** advance gamestate by an atomic step */
export function step(game) {
    const id = game.schedule[0]
    const entity = game.entities[id]
    return Behavior[entity.type](entity, game)
}

/** end current actor's turn and setup its next turn */
function reschedule(game) {
    const id = game.schedule.shift()
    game.schedule.push(id)
}

/** end current actor's turn and remove it from the schedule */
function unschedule(game) {
    game.schedule.shift()
}
