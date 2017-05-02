///<reference path="../lib/pixi.js.d.ts"/>

import { WIDTH, HEIGHT } from '../data/constants'
import { TileName } from '../data/tile'
import { SpriteName, spriteNames, xu, smallyu, bigyu, color } from '../data/style'

import { pos2xy } from '../engine/position'
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

    private textures: Record<SpriteName, PIXI.Texture>

    private skipAnimation: boolean
    private delayId: number

    constructor() {
        super()
        this.app = new PIXI.Application({
            width: canvasWidth,
            height: canvasHeight,
        })
        root.appendChild(this.app.view)
        for (let i = 0; i < spriteNames.length; i++) {
            PIXI.loader.add(spriteNames[i], `${spriteNames[i]}.png`)
        }
        PIXI.loader.load(this.init.bind(this))
    }

    init(loader: PIXI.loaders.Loader, resources: any) {
        this.textures = createTextureCache(resources)
        this.app.stage.addChild(this.createTiles())
        this.app.stage.addChild(this.createMobs())
        this.loop()
        window.addEventListener('keydown', keydown.bind(window, this), false)
    }

    createTiles(): PIXI.Container {
        const container = new PIXI.Container()
        this.tiles = {}
        forEachPos((pos, x, y) => {
            const sprite = new PIXI.Sprite(this.textures[this.getTile(pos)])
            const {left, top} = calcOffset(x, y)
            sprite.x = left
            sprite.y = top
            sprite.visible = false
            container.addChild(sprite)
            this.tiles[pos] = sprite
        })
        return container
    }

    createMobs(): PIXI.Container {
        const container = new PIXI.Container
        const sprite = new PIXI.Sprite(this.textures.player)
        const pos = this.getPosition(this.getPlayer())
        const {x, y} = pos2xy(pos)
        const {left, top} = calcOffset(x, y)
        sprite.x = left
        sprite.y = top
        container.addChild(sprite)
        this.mobs = {
            [pos]: sprite
        }
        return container
    }

    addFov(position: number) {
        super.addFov(position)
        const tile = this.getTile(position)
        const sprite = this.tiles[position]
        sprite.visible = true
        sprite.texture = this.textures[tile]
        sprite.tint = color[tile]
        sprite.alpha = 1
    }

    clearFov() {
        super.clearFov()
    }

    setTile(position: number, tile: TileName) {
        super.setTile(position, tile)
        const sprite = this.tiles[position]
        sprite.texture = this.textures[tile]
        sprite.tint = color[tile]
    }

    setMemory(position: number, tile: TileName) {
        super.setMemory(position, tile)
        const sprite = this.tiles[position]
        sprite.texture = this.textures[tile]
        sprite.tint = color[tile]
        sprite.alpha = 0.5
        sprite.visible = true
    }
    
    setPosition(entity: number, position: number) {
        super.setPosition(entity, position)
    }

    offsetPosition(entity: number, delta: number) {
        const pos = this.getPosition(entity)
        super.offsetPosition(entity, delta)
        const sprite = this.mobs[pos]
        if (sprite) {
            this.mobs[pos] = undefined
            const {x, y} = pos2xy(pos + delta)
            const {left, top} = calcOffset(x, y)
            sprite.x = left
            sprite.y = top
            this.mobs[pos + delta] = sprite
        }
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

function createTextureCache(resources: any): Record<SpriteName, PIXI.Texture> {
    let cache: any = {}
    spriteNames.forEach(name => {
        cache[name] = resources[name].texture
    })
    return cache
}

function calcOffset(x: number, y: number) {
    return {
        left: (x - (HEIGHT - y - 1) / 2) * xu,
        top: y * smallyu,
    }
}
