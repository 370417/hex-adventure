import { WIDTH, HEIGHT } from '../data/constants'
import { transparency } from '../data/tile'

import { xy2pos } from './position'
import { reschedule } from './schedule'
import { Game } from './game'
import { shadowcast } from './fov'
import { Components } from './components'
import { walk } from './mob'
import * as Entity from './entity'

/** @file manipulates the player character */

/** create a new player */
export function create(entity: number, {position, behavior, fov, memory}: Components) {
    position[entity] = xy2pos(Math.round(WIDTH / 2), Math.round(HEIGHT / 2))
    behavior[entity] = 'player'
    fov[entity] = {}
    memory[entity] = {}
}

/** move the player */
export function move(game: Game, player: number, direction: number) {
    walk(game, player, direction)
    look(game, player)
    reschedule(game.schedule)
}

export function look(game: Game, self: number) {
    const tiles = game.level.tiles
    const {fov, memory, position} = game.components
    fov[self] = {}
    // function transparent(pos: number) {
    //     return game.level.tiles[pos] === 'floor'
    // }
    // function reveal(pos: number) {
    //     fov[self][pos] = true
    //     memory[self][pos] = game.level.tiles[pos]
    // }
    shadowcast(position[self], pos => transparency[tiles[pos]] === 2, pos => fov[self][pos] = true)
    shadowcast(position[self], pos => transparency[tiles[pos]] > 0, pos => memory[self][pos] = tiles[pos])
}

export function magic(game: Game, player: number) {
    const {position, velocity, behavior} = game.components
    reschedule(game.schedule)
    const spike = Entity.create(game)
    game.schedule.unshift(spike)
    position[spike] = position[player] + 1
    velocity[spike] = 1
    behavior[spike] = 'spike'
}
