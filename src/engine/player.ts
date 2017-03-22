import { WIDTH, HEIGHT } from '../data/constants'

import { Entity, Entities, create as createEntity } from './entity'
import { xy2pos } from './position'
import { Behavior, reschedule } from './schedule'
import { Game } from './game'
import { fov } from './fov'

export interface Player extends Entity {
    type: string
    pos: number
    fov: {[pos: number]: boolean}
    memory: {[pos: number]: string}
}

/** create a new player */
export function create(entities: Entities): Player {
    return Object.assign(createEntity(entities), {
        type: 'player',
        pos: xy2pos(intHalf(WIDTH), intHalf(HEIGHT)),
        fov: {},
        memory: {},
    })
}

Behavior.player = function(game: Game, self: Player) {
    // initialize fov if uninitiazlied
    if (!self.fov[self.pos]) {
        look(game, self)
    }
    return Infinity
}

function look(game: Game, self: Player) {
    self.fov = {}
    function transparent(pos: number) {
        return game.level.types[pos] === 'floor'
    }
    function reveal(pos: number) {
        self.fov[pos] = true
        self.memory[pos] = game.level.types[pos]
    }
    fov(self.pos, transparent, reveal)
}

export function move(game: Game, self: Player, direction: number) {
    const {actors, types} = game.level
    const targetPos = self.pos + direction
    if (types[targetPos] === 'floor') {
        actors[self.pos] = undefined
        self.pos = targetPos
        actors[self.pos] = self.id
    }
    look(game, self)
    reschedule(game)
}

/** return half of n rounded to an int */
function intHalf(n: number) {
    return Math.round(n / 2)
}
