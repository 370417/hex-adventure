import { getGame, save } from './game'
import * as Level from './level'
import { step } from './actor'

/** handles displaying the game and the game loop */

const xu = 18
const smallyu = 16
const bigyu = 24
const root = document.getElementById('game')
const tiles = createTiles()
const game = getGame()

/** advance the gamestate until player input is needed */
export function loop() {
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

/** call [fun] after waiting for [frames] */
function defer(fun, frames) {
    if (frames) {
        requestAnimationFrame(() => defer(fun, frames - 1))
    }
    fun()
}

/** render a game */
function render(game) {
    Level.forEachPos(pos => {
        const $tile = tiles[pos]
        const actorId = game.level.actors[pos]
        if (game.player.fov[pos]) {
            if (actorId) {
                $tile.dataset.type = game.entities[actorId].type
            } else {
                $tile.dataset.type = game.level.types[pos]
            }
        } else {
            $tile.dataset.type = game.level.types[pos]
            $tile.style.opacity = '0.5'
        }
    })
}

/** put a tile element in the position (x, y) */
function positionTile($tile, x, y) {
    const realx = (x - (Level.HEIGHT - y - 1) / 2) * xu
    const realy = (y - 1) * smallyu + bigyu
    $tile.style.left = realx + 'px'
    $tile.style.top = realy + 'px'
}

/** create tile elements and return a dict of them by position */
function createTiles() {
    const tiles = {}
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