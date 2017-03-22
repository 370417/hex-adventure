import { forEachPos } from '../engine/level'
import { Game } from '../engine/game'

import Tile from './tile'

import * as React from 'react'

/** array of {pos, x, y} */
const positions = createPositions()

export default function Grid({game}: {game: Game}) {
    const {types, actors} = game.level
    const {fov, memory} = game.player
    return <div>{
        positions.map(({pos, x, y}) => <Tile
            key={pos}
            type={actors[pos] && fov[pos] && game.entities[actors[pos]].type || types[pos]}
            opacity={fov[pos] && 1.0 || memory[pos] && 0.5 || 0}
            x={x}
            y={y}
        />)
    }</div>
}

function createPositions() {
    const positions: {pos: number, x: number, y: number}[] = []
    forEachPos((pos, x, y) => {
        positions.push({pos, x, y})
    })
    return positions
}
