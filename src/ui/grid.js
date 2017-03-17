import { forEachPos } from '../engine/level'

import Tile from './tile'

import React from 'react'

/** array of {pos, x, y} */
const positions = createPositions()

export default function Grid({game}) {
    const {types, actors} = game.level
    const fov = game.player.fov
    return <div>{
        positions.map(({pos, x, y}) => <Tile
            key={pos}
            type={types[pos]}
            actor={fov[pos] && actors[pos] && game.entities[actors[pos]]}
            visible={fov[pos]}
            x={x}
            y={y}
        />)
    }</div>
}

function createPositions() {
    const positions = []
    forEachPos((pos, x, y) => {
        positions.push({pos, x, y})
    })
    return positions
}
