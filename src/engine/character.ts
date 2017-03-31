import { canWalk } from '../data/tile'

import { Components } from './components'
import { Level } from './level'

export function move(level: Level, components: Components, entity: number, direction: number) {
    level.actors[components.position[entity]] = undefined
    components.position[entity] = components.position[entity] + direction
    level.actors[components.position[entity]] = entity
}

export function walk(level: Level, components: Components, entity: number, direction: number) {
    const targetPos = components.position[entity] + direction
    if (canWalk[level.types[targetPos]]) {
        move(level, components, entity, direction)
    }
}
