import { WIDTH, HEIGHT } from '../data/constants'

import { xy2pos } from './position'
import { reschedule } from './schedule'
import { Game } from './game'
import { shadowcast } from './fov'
import { Components } from './components'

/** create a new player */
export function create(entity: number, {position, behavior, fov, memory}: Components) {
    position[entity] = xy2pos(Math.round(WIDTH / 2), Math.round(HEIGHT / 2))
    behavior[entity] = 'player'
    fov[entity] = {}
    memory[entity] = {}
}

export function move(game: Game, self: number, direction: number) {
    const {position} = game.components
    const {actors, types} = game.level
    const targetPos = position[self] + direction
    if (types[targetPos] === 'floor') {
        actors[position[self]] = undefined
        position[self] = targetPos
        actors[position[self]] = self
    }
    look(game, self)
    reschedule(game)
}

export function look(game: Game, self: number) {
    const {fov, memory, position} = game.components
    fov[self] = {}
    function transparent(pos: number) {
        return game.level.types[pos] === 'floor'
    }
    function reveal(pos: number) {
        fov[self][pos] = true
        memory[self][pos] = game.level.types[pos]
    }
    shadowcast(position[self], transparent, reveal)
}
