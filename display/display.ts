import { Game, getGame, save } from '../game/game'
import * as Level from '../game/level'
import { step } from '../game/actor'
import { Tile } from '../game/tile'

const xu = 18
const smallyu = 16
const bigyu = 24
const root = document.getElementById('game')
const tiles = {}
const game = getGame()

export function init(): void {
    createTiles()
    loop()
}

function loop(): void {
    let delay = 0
    while (!delay) {
        delay = step(game)
    }
    render(game)
    if (delay === Infinity) {
        save(game)
    } else {
        defer(loop, delay)
    }
}

function defer(fun: Function, frames: number): void {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1))
    }
    fun()
}

function render(game: Game): void {
    Level.forEachPos(pos => {
        const type = game.level.types[pos]
        const tile = tiles[pos]
        tile.dataset.type = Tile[type]
    })
}

function positionTile(tile, x, y) {
    const realx = (x - (Level.HEIGHT - y - 1) / 2) * this.xu
    const realy = (y - 1) * this.smallyu + this.bigyu
    tile.style.left = realx + 'px'
    tile.style.top = realy + 'px'
}

function createTiles() {
    const tiles = document.createElement('div')
    tiles.id = 'tiles'

    Level.forEachPos((pos, x, y) => {
        const tile = document.createElement('div')
        tile.classList.add('tile')
        tile.dataset.type = 'NULL'
        this.positionTile(tile, x, y)
        tiles.appendChild(tile)
        tiles[pos] = tile
    })

    this.root.appendChild(tiles)
}
