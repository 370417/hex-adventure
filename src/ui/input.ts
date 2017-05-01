import { dir1, dir3, dir5, dir7, dir9, dir11 } from '../data/constants'

import { move, magic } from '../engine/player'

import { Display } from './display'

/** @file handles input */

const movement: {[code: string]: number} = {
    KeyE: dir1,
    KeyD: dir3,
    KeyX: dir5,
    KeyZ: dir7,
    KeyA: dir9,
    KeyW: dir11,
}


export function keydown(game: Display, e: KeyboardEvent) {
    game.skip()
    const direction = movement[e.code]
    if (direction) {
        move(game, game.getPlayer(), direction)
        game.loop()
    }
    if (e.code === 'Digit1') {
        magic(game, game.getPlayer())
        game.loop()
    }
}
