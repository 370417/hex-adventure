import { Game } from './game'
import { look } from './player'
import { reschedule, unschedule } from './schedule'
import { calcDistancePos } from './position'
import { forEachPos } from './level'

import { random } from '../lib/alea'

/** @file specify actor behavior */

export type Behavior = 'player' | 'snake' | 'environment'

export const behaviors: Record<Behavior, (game: Game, self: number) => number> = {
    player: (game, self) => {
        const {fov, position} = game.components
        // initialize fov if uninitiazlied
        if (!fov[position[self]]) {
            look(game, self)
        }
        return Infinity
    },
    snake: (game, self) => {
        reschedule(game.schedule)
        return 0
    },
    environment: (game, self) => {
        const {tiles, grassDelay} = game.level
        forEachPos(pos => {
            if (tiles[pos] === 'shortGrass' && grassDelay[pos] !== undefined) {
                grassDelay[pos]--
                if (!grassDelay[pos]) {
                    grassDelay[pos] = undefined
                    tiles[pos] = 'tallGrass'
                }
            }
        })
        reschedule(game.schedule)
        return 0
    },
}
