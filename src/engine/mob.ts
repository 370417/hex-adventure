import { canWalk } from '../data/tile'

import { Components } from './components'
import { Level } from './level'

/** @file manipulates entities that can be represented on the map */

/** move the entity */
export function move(level: Level, components: Components, entity: number, direction: number) {
    level.mobs[components.position[entity]] = undefined
    components.position[entity] = components.position[entity] + direction
    level.mobs[components.position[entity]] = entity
}

/** move the entity if possible */
export function walk(level: Level, components: Components, entity: number, direction: number) {
    const targetPos = components.position[entity] + direction
    if (canWalk[level.tiles[targetPos]]) {
        move(level, components, entity, direction)
    }
}
