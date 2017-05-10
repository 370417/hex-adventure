///<reference path="../lib/pixi.js.d.ts"/>

import { WIDTH, HEIGHT } from '../data/constants'
import { TileName } from '../data/tile'
import { SpriteName, spriteNames, xu, smallyu, bigyu, color } from '../data/style'

import { pos2xy } from '../engine/position'
import { forEachPos } from '../engine/level'
import { Game, save } from '../engine/game'
import { step } from '../engine/behavior'

import { keydown } from './input'

/** @file handles displaying the game and the game loop */

export interface Display {
    game: Game
    app: PIXI.Application
    tiles: {[pos: number]: PIXI.Sprite}
    textures: Record<SpriteName, PIXI.Texture>
    skipAnimation: boolean
    animationId: number
}

// export function init(root: HTMLElement) {}

export function create(game: Game, root: HTMLElement): Display {
    const width = (WIDTH - HEIGHT / 2 + 1) * xu
    const height = (HEIGHT - 1) * smallyu + bigyu
    const app = new PIXI.Application({width, height})
    const display = {
        game,
        app,
        tiles: createTiles(app.stage),
        textures: createTextures(),
        skipAnimation: false,
        animationId: 0,
    }
    loop(display)
    root.appendChild(display.app.view)
    loadTextures(display)
    window.addEventListener('keydown', keydown.bind(window, display), false)
    return display
}

function createTextures(): Record<SpriteName, PIXI.Texture> {
    const textures: any = {}
    spriteNames.forEach((spriteName) => {
        textures[spriteName] = PIXI.Texture.EMPTY
    })
    return textures
}

function createTiles(renderer: PIXI.Container): {[pos: number]: PIXI.Sprite} {
    const tiles: {[pos: number]: PIXI.Sprite} = {}
    forEachPos((pos, x, y) => {
        const sprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
        sprite.x = (x - (HEIGHT - y - 1) / 2) * xu
        sprite.y = y * smallyu
        tiles[pos] = sprite
        renderer.addChild(sprite)
    })
    return tiles
}

type Resources = Record<SpriteName, { texture: PIXI.Texture }>

function loadTextures(display: Display) {
    spriteNames.forEach((name) => {
        PIXI.loader.add(name, `res/${name}.png`)
    })
    PIXI.loader.load((loader: PIXI.loaders.Loader, resources: Resources) => {
        spriteNames.forEach((name) => {
            display.textures[name] = resources[name].texture
        })
        render(display)
    })
}

function render(display: Display) {
    forEachPos((pos, x, y) => {
        const sprite = display.tiles[pos]
        const level = display.game.level
        const tile = level.tiles[pos]
        const mob = level.mobs[pos]
        if (display.game.fov[pos]) {
            if (mob) {
                const behavior = display.game.prop.behavior[mob] as TileName
                sprite.texture = display.textures[behavior]
                sprite.tint = color[behavior]
            } else {
                sprite.texture = display.textures[tile]
                sprite.tint = color[tile]
            }
            sprite.alpha = 1.0
            sprite.visible = true
        } else if (display.game.memory[pos]) {
            sprite.texture = display.textures[tile]
            sprite.tint = color[tile]
            sprite.alpha = 0.5
            sprite.visible = true
        } else {
            sprite.visible = false
        }
    })
    display.app.render()
}

export function loop(display: Display) {
    let delay = 0
    while (!delay || display.skipAnimation && delay < Infinity) {
        delay = step(display.game)
    }
    render(display)
    if (delay === Infinity) {
        display.skipAnimation = false
        save(display.game)
    } else {
        display.animationId = setTimeout(loop, 10 * delay, display)
    }
}

export function skip(display: Display) {
    if (display.animationId == undefined) return
    display.skipAnimation = true
    cancelAnimationFrame(display.animationId)
    display.animationId = undefined
    loop(display)
}
