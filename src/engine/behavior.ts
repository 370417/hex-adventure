import { Game } from './game'
import { look } from './player'
import { calcDistancePos } from './position'
import { forEachPos } from './level'

import { canWalk } from '../data/tile'

import { random } from '../lib/alea'

/** @file specify actor behavior */

export type Behavior = 'player' | 'snake' | 'environment' | 'spike'

export const behaviors: Record<Behavior, (game: Game, self: number) => number> = {
    player: (game, self) => {
        // initialize fov if uninitiazlied
        if (!game.getFov(game.getPosition(self))) {
            look(game, self)
        }
        return Infinity
    },
    snake: (game, self) => {
        game.reschedule()
        return 0
    },
    environment: (game, self) => {
        forEachPos(pos => {
            const grassDelay = game.getGrassDelay(pos)
            if (game.getTile(pos) === 'shortGrass' && grassDelay !== undefined) {
                game.setGrassDelay(pos, grassDelay - 1)
                if (!game.getGrassDelay(pos)) {
                    game.setGrassDelay(pos, undefined)
                    game.setTile(pos, 'tallGrass')
                }
            }
        })
        game.reschedule()
        return 0
    },
    spike: (game, self) => {
        const pos = game.getPosition(self)
        if (canWalk[game.getTile(pos)]) {
            game.setTile(pos, 'spikes')
            game.offsetPosition(self, game.getVelocity(self))
            look(game, game.getPlayer())
        } else {
            game.unschedule()
        }
        return 6
    }
}

export function step(game: Game) {
    const entity = game.getCurrentEntity()
    const behavior = game.getBehavior(entity)
    return behaviors[behavior](game, entity)
}
