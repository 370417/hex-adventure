import { dir1, dir3, dir5, dir7, dir9, dir11 } from '../data/constants'

import { Game } from '../engine/game'
import { move, magic } from '../engine/player'

import { loop, skip } from './display'

/** @file handles input */

const movement: {[code: string]: number} = {
    KeyE: dir1,
    KeyD: dir3,
    KeyX: dir5,
    KeyZ: dir7,
    KeyA: dir9,
    KeyW: dir11,
}


export function keydown(game: Game, e: KeyboardEvent) {
    skip()
    const direction = movement[e.code]
    if (direction) {
        move(game, game.player, direction)
        loop()
    }
    if (e.code === 'Digit1') {
        magic(game, game.player)
        loop()
    }
}
