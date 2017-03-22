import { getGame, save } from '../engine/game'
import { step } from '../engine/schedule'

import Grid from './grid'
import { keydown } from './input'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

/** @file handles displaying the game and the game loop */

const root = document.getElementById('game')
const game = getGame()

window.addEventListener('keydown', keydown.bind(window, game), false)

/** advance the gamestate until player input is needed */
export function loop() {
    let delay = 0
    while (!delay) {
        delay = step(game)
    }
    ReactDOM.render(<Grid game={game} />, root)
    if (delay === Infinity) {
        save(game)
    } else {
        defer(loop, delay)
    }
}

/** call [fun] after waiting for [frames] */
function defer(fun: () => void, frames: number) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1))
    } else {
        fun()
    }
}
