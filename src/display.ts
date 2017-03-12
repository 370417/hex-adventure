import { Game, getGame, save } from './game'
import * as Level from './level'
import { step } from './actor'
import { Tile } from './tile'

const xu = 18
const smallyu = 16
const bigyu = 24
const root = document.getElementById('game')
const tiles = createTiles()
const game = getGame()

export function loop(): void {
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

function positionTile(tile: HTMLDivElement, x: number, y: number): void {
    const realx = (x - (Level.HEIGHT - y - 1) / 2) * xu
    const realy = (y - 1) * smallyu + bigyu
    tile.style.left = realx + 'px'
    tile.style.top = realy + 'px'
}

function createTiles() {
    const tiles: {[pos: number]: HTMLDivElement} = {}
    const $tiles = document.createElement('div')
    $tiles.id = 'tiles'

    Level.forEachPos((pos, x, y) => {
        const tile = document.createElement('div')
        tile.classList.add('tile')
        tile.dataset.type = 'null'
        positionTile(tile, x, y)
        $tiles.appendChild(tile)
        tiles[pos] = tile
    })

    root.appendChild($tiles)
    return tiles
}
