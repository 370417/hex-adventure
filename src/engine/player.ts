import { WIDTH, HEIGHT } from '../data/constants'
import { transparency } from '../data/tile'

import { xy2pos } from './position'
import { reschedule } from './schedule'
import { Game } from './game'
import { shadowcast } from './fov'
import { Components } from './components'
import { walk } from './character'

/** create a new player */
export function create(entity: number, {position, behavior, fov, memory}: Components) {
    position[entity] = xy2pos(Math.round(WIDTH / 2), Math.round(HEIGHT / 2))
    behavior[entity] = 'player'
    fov[entity] = {}
    memory[entity] = {}
}

export function move(game: Game, entity: number, direction: number) {
    walk(game.level, game.components, entity, direction)
    look(game, entity)
    reschedule(game)
}

export function look(game: Game, self: number) {
    const types = game.level.types
    const {fov, memory, position} = game.components
    fov[self] = {}
    // function transparent(pos: number) {
    //     return game.level.types[pos] === 'floor'
    // }
    // function reveal(pos: number) {
    //     fov[self][pos] = true
    //     memory[self][pos] = game.level.types[pos]
    // }
    shadowcast(position[self], pos => transparency[types[pos]] === 2, pos => fov[self][pos] = true)
    shadowcast(position[self], pos => transparency[types[pos]] > 0, pos => memory[self][pos] = types[pos])
}
