import { dir1, dir3, dir5, dir7, dir9, dir11 } from '../data/constants'

import { move, magic } from '../engine/player'

import { Display, skip, loop } from './display'

/** @file handles input */

const movement: {[code: string]: number} = {
    KeyE: dir1,
    KeyD: dir3,
    KeyX: dir5,
    KeyZ: dir7,
    KeyA: dir9,
    KeyW: dir11,
}


export function keydown(display: Display, e: KeyboardEvent) {
    skip(display)
    const direction = movement[e.code]
    if (direction) {
        move(display.game, display.game.player, direction)
        loop(display)
    }
    if (e.code === 'Digit1') {
        magic(display.game, display.game.player)
        loop(display)
    }
}
