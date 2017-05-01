///<reference path="../lib/pixi.js.d.ts"/>

import { WIDTH, HEIGHT } from '../data/constants'
import { TileName } from '../data/tile'
import { xu, smallyu, bigyu, color } from '../data/style'

import { forEachPos } from '../engine/level'
import { Game } from '../engine/game'
import { step } from '../engine/behavior'

import { keydown } from './input'

/** @file handles displaying the game and the game loop */

const root = document.getElementById('game')

const canvasWidth = (WIDTH - HEIGHT / 2 + 1) * xu
const canvasHeight = (HEIGHT - 1) * smallyu + bigyu

export class Display extends Game {
    app: PIXI.Application

    private tiles: {[pos: number]: PIXI.Sprite}
    private mobs: {[pos: number]: PIXI.Sprite}

    private skipAnimation: boolean
    private delayId: number

    constructor() {
        super()
        this.app = new PIXI.Application({
            width: canvasWidth,
            height: canvasHeight,
        })
        root.appendChild(this.app.view)
        this.tiles = {}
        PIXI.loader
            .add('wall', 'wall.png')
            .add('floor', 'floor.png')
            .add('shortGrass', 'shortGrass.png')
            .add('tallGrass', 'tallGrass.png')
            .add('spikes', 'spikes.png')
            .add('player', 'player.png')
            .load(this.init.bind(this))
    }

    init(loader: PIXI.loaders.Loader, resources: any) {
        const bgContainer = new PIXI.Container()
        const mobContainer = new PIXI.Container()
        forEachPos((pos, x, y) => {
            const tileName = this.getTile(pos)
            const tile = new PIXI.Sprite(resources[tileName].texture)
            const {left, top} = calcOffset(x, y)
            tile.x = left
            tile.y = top
            if (this.getMob(pos) !== undefined) {
                const mobName = this.getBehavior(this.getMob(pos))
                tile.visible = false
                const mobTile = new PIXI.Sprite(resources[mobName].texture)
                mobTile.x = left
                mobTile.y = top
                mobTile.tint = color[mobName]
                mobContainer.addChild(mobTile)
            } else if (this.getFov(this.getPlayer(), pos)) {
                tile.alpha = 1.0
                tile.tint = color[tileName]
                tile.visible = true
            } else if (this.getMemory(this.getPlayer(), pos)) {
                tile.alpha = 0.5
                tile.tint = color[tileName]
                tile.visible = true
            } else {
                tile.visible = false
            }
            this.tiles[pos] = tile
            bgContainer.addChild(tile)
        })
        this.app.stage.addChild(bgContainer)
        this.app.stage.addChild(mobContainer)
        // this.app.render()
        window.addEventListener('keydown', keydown.bind(window, this), false)
    }

    setTile(position: number, tile: TileName) {
        super.setTile(position, tile)
    }
    
    setPosition(entity: number, position: number) {
        super.setPosition(entity, position)
    }

    offsetPosition(entity: number, delta: number) {
        super.offsetPosition(entity, delta)
    }

    loop() {
        let delay = 0
        while (!delay || this.skipAnimation && delay < Infinity) {
            delay = step(this)
        }
        this.app.render()
        if (delay === Infinity) {
            this.skipAnimation = false
            this.save()
        } else {
            this.defer(delay)
        }
    }

    /** call loop after waiting a certain number of frames */
    defer(frames: number) {
        if (frames) {
            this.delayId = requestAnimationFrame(this.defer.bind(this, frames - 1))
        } else {
            this.loop()
        }
    }

    skip() {
        if (this.delayId === undefined) return
        this.skipAnimation = false
        cancelAnimationFrame(this.delayId)
        this.loop()
    }
}

// window.addEventListener('keydown', keydown.bind(window, game), false)

function calcOffset(x: number, y: number) {
    return {
        left: (x - (HEIGHT - y - 1) / 2) * xu,
        top: y * smallyu,
    }
}

let animationId: number
let animationFun: Function
let skippingAnimation = false

/** advance the gamestate until player input is needed */
// export function loop() {
//     let delay = 0
//     while (!delay || skippingAnimation && delay < Infinity) {
//         delay = step(game)
//     }
//     render(game)
//     if (delay === Infinity) {
//         skippingAnimation = false
//         game.save()
//     } else {
//         defer(loop, delay)
//     }
// }

// function render(game: Game) {
//     app.render()
// }

// /** call [fun] after waiting for [frames] */
// function defer(fun: () => void, frames: number) {
//     if (frames) {
//         animationFun = fun
//         animationId = requestAnimationFrame(() => defer(fun, frames - 1))
//     } else {
//         fun()
//     }
// }

// /** skip all animations until player's next turn */
// export function skip() {
//     if (animationId === undefined) return
//     skippingAnimation = true
//     cancelAnimationFrame(animationId)
//     animationFun()
// }
