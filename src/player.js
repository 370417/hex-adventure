import * as Entity from './entity'
import * as Level from './level'
import { xy2pos } from './position'

/** create a new player */
export function create(entities) {
    const player = Entity.create(entities)
    player.type = 'player'
    player.pos = xy2pos(half(Level.WIDTH), half(Level.HEIGHT))
    player.fov = {}
    return player
}

/** return half of n rounded to an int */
function half(n) {
    return Math.round(n / 2)
}