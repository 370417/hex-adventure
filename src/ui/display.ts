///<reference path="../lib/pixi.js.d.ts"/>

import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu, bigyu } from '../data/style'

import { getGame, save } from '../engine/game'
import { step } from '../engine/schedule'

import Grid from './grid'
import { keydown } from './input'

/** @file handles displaying the game and the game loop */

const root = document.getElementById('game')
const game = getGame()

let canvasWidth = (WIDTH - HEIGHT / 2 + 1) * xu
let canvasHeight = HEIGHT * smallyu

const app = new PIXI.Application({
    width: canvasWidth,
    height: canvasHeight,
})
root.appendChild(app.view)

window.addEventListener('keydown', keydown.bind(window, game), false)

export 

let animationId: number
let animationFun: Function
let skippingAnimation = false

/** advance the gamestate until player input is needed */
export function loop() {
    let delay = 0
    while (!delay || skippingAnimation && delay < Infinity) {
        delay = step(game)
    }
    ReactDOM.render(<Grid game={game} />, root)
    if (delay === Infinity) {
        skippingAnimation = false
        save(game)
    } else {
        defer(loop, delay)
    }
}

/** call [fun] after waiting for [frames] */
function defer(fun: () => void, frames: number) {
    if (frames) {
        animationFun = fun
        animationId = requestAnimationFrame(() => defer(fun, frames - 1))
    } else {
        fun()
    }
}

/** skip all animations until player's next turn */
export function skip() {
    if (animationId === undefined) return
    skippingAnimation = true
    cancelAnimationFrame(animationId)
    animationFun()
}
