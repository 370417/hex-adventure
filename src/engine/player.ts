import { WIDTH, HEIGHT } from '../data/constants'
import { transparency } from '../data/tile'

import { xy2pos } from './position'
import { Game } from './game'
import { shadowcast } from './fov'
import { walk } from './mob'

/** @file manipulates the player character */

/** move the player */
export function move(game: Game, player: number, direction: number) {
    walk(game, player, direction)
    look(game, player)
    game.reschedule()
}

export function look(game: Game, self: number) {
    game.clearFov(self)
    shadowcast(
        game.getPosition(self),
        pos => transparency[game.getTile(pos)] === 2,
        pos => game.addFov(self, pos)
    )
    shadowcast(
        game.getPosition(self),
        pos => transparency[game.getTile(pos)] > 0,
        pos => game.setMemory(self, pos, game.getTile(pos))
    )
}

export function magic(game: Game, player: number) {
    game.reschedule()
    const spike = game.createEntity()
    game.schedule(spike)
    game.setPosition(spike, game.getPosition(player) + 1)
    game.setVelocity(spike, 1)
    game.setBehavior(spike, 'spike')
}
