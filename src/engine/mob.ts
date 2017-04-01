import { TileName, canWalk } from '../data/tile'

import { Game } from './game'
import * as Entity from './entity'
import { randint } from './random'

/** @file manipulates entities that can be represented on the map */

/** move the entity */
export function move(game: Game, entity: number, direction: number) {
    const mobs = game.level.mobs
    const position = game.components.position
    mobs[position[entity]] = undefined
    position[entity] = position[entity] + direction
    mobs[position[entity]] = entity
}

/** called when an entity enters a tile */
type OnWalk = (game: Game, pos: number, entity: number, direction: number) => void

const onWalk: Partial<Record<TileName, OnWalk>> = {
    tallGrass: (game, pos, entity, direction) => {
        game.level.tiles[pos] = 'shortGrass'
        game.level.grassDelay[pos] = randint(3, 5, game.alea)
    }
}

/** move the entity if possible */
export function walk(game: Game, entity: number, direction: number) {
    const targetPos = game.components.position[entity] + direction
    const targetTile = game.level.tiles[targetPos]
    if (canWalk[game.level.tiles[targetPos]]) {
        move(game, entity, direction)
        if (onWalk[targetTile]) {
            onWalk[targetTile](game, targetPos, entity, direction)
        }
    }
}

