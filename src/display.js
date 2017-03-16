import { HEIGHT } from './constants'
import { getGame, save } from './game'
import * as Level from './level'
import { step } from './actor'

import React from 'react'
import ReactDOM from 'react-dom'

/** handles displaying the game and the game loop */

const xu = 18
const smallyu = 16
const bigyu = 24
const root = document.getElementById('game')
// const tiles = createTiles()
const game = getGame()

function Tile(props) {
    const realx = (props.x - (HEIGHT - props.y - 1) / 2) * xu
    const realy = props.y * smallyu
    const style = {
        left: realx + 'px',
        top: realy + 'px',
    }
    return <div className={`tile ${props.type}`} style={style} />
}

const positions = generatePositions()
function generatePositions() {
    const positions = []
    Level.forEachPos((pos, x, y) => {
        positions.push({pos, x, y})
    })
    return positions
}

function Display({game}) {
    return <div>{positions.map(({pos, x, y}) => <Tile key={pos} type={game.level.types[pos]} x={x} y={y} />)}</div>
}

/** advance the gamestate until player input is needed */
export function loop() {
    let delay = 0
    while (!delay) {
        delay = step(game)
    }
    ReactDOM.render(<Display game={game} />, root)
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
