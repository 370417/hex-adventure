import { Game, getGame, save } from './game'
import * as Level from './level'
import { step } from './actor'
import { Tile } from './tile'

/// handles displaying the game and the game loop

const xu = 18
const smallyu = 16
const bigyu = 24
const root = document.getElementById('game')
const tiles = createTiles()
const game = getGame()

/// advance the gamestate until player input is needed
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

/// call [fun] after waiting for [frames]
function defer(fun: Function, frames: number): void {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1))
    }
    fun()
}

/// render the [game]
function render(game: Game): void {
    Level.forEachPos(pos => {
        const type = game.level.types[pos]
        const tile = tiles[pos]
        tile.dataset.type = Tile[type]
    })
}

/// put the [tile] element in the position [x], [y]
function positionTile(tile: HTMLDivElement, x: number, y: number): void {
    const realx = (x - (Level.HEIGHT - y - 1) / 2) * xu
    const realy = (y - 1) * smallyu + bigyu
    tile.style.left = realx + 'px'
    tile.style.top = realy + 'px'
}

/// create tile elements and return a dict of them by position
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