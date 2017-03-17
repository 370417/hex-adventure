import { getGame, save } from '../engine/game'
import * as Level from '../engine/level'
import { step } from '../engine/actor'

import Grid from './grid'

import React from 'react'
import ReactDOM from 'react-dom'

/** @file handles displaying the game and the game loop */

const root = document.getElementById('game')
const game = getGame()

const positions = generatePositions()
function generatePositions() {
    const positions = []
    Level.forEachPos((pos, x, y) => {
        positions.push({pos, x, y})
    })
    return positions
}

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
function defer(fun, frames) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1))
    }
    fun()
}
