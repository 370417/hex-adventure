import { Game } from './game'
import { shadowcast } from './fov'
import { look } from './player'

/** @file specify actor behavior */

export type Behavior = 'player'

export const behaviors: Record<Behavior, (game: Game, self: number) => number> = {
    player: (game, self) => {
        const {fov, position} = game.components
        // initialize fov if uninitiazlied
        if (!fov[position[self]]) {
            look(game, self)
        }
        return Infinity
    }
}
