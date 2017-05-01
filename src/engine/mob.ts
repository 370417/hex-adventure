import { TileName, canWalk } from '../data/tile'

import { Game } from './game'
import { randint } from './random'

/** @file manipulates entities that can be represented on the map */

/** move the entity */
export function move(game: Game, entity: number, direction: number) {
    game.removeMob(game.getPosition(entity))
    game.offsetPosition(entity, direction)
    game.setMob(game.getPosition(entity), entity)
}

/** called when an entity enters a tile */
type OnWalk = (game: Game, pos: number, entity: number, direction: number) => void

const onWalk: Partial<Record<TileName, OnWalk>> = {
    tallGrass: (game, pos, entity, direction) => {
        game.setTile(pos, 'shortGrass')
        game.setGrassDelay(pos, randint(3, 5, game.random.bind(game)))
    }
}

/** move the entity if possible */
export function walk(game: Game, entity: number, direction: number) {
    const targetPos = game.getPosition(entity) + direction
    const targetTile = game.getTile(targetPos)
    if (canWalk[game.getTile(targetPos)]) {
        move(game, entity, direction)
        if (onWalk[targetTile]) {
            onWalk[targetTile](game, targetPos, entity, direction)
        }
    }
}

