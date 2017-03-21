import { WIDTH, HEIGHT } from '../data/constants'

import { Entity, Entities, create as createEntity } from './entity'
import { xy2pos } from './position'
import { Behavior } from './actor'
import { Game } from './game'
import { fov } from './fov'

export interface Player extends Entity {
    type: string
    pos: number
    fov: {[pos: number]: boolean}
}

/** create a new player */
export function create(entities: Entities): Player {
    return Object.assign(createEntity(entities), {
        type: 'player',
        pos: xy2pos(intHalf(WIDTH), intHalf(HEIGHT)),
        fov: {}
    })
}

Behavior.player = function(self: Player, game: Game) {
    function transparent(pos: number) {
        return game.level.types[pos] === 'floor'
    }
    function reveal(pos: number) {
        self.fov[pos] = true
    }
    fov(self.pos, transparent, reveal)
    return Infinity
}


/** return half of n rounded to an int */
function intHalf(n: number) {
    return Math.round(n / 2)
}
