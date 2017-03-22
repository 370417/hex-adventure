import { forEachPos } from '../engine/level'
import { Game } from '../engine/game'

import Tile from './tile'

import * as React from 'react'

/** renders all map tiles */
export default function Grid({game}: {game: Game}) {
    const {types, actors} = game.level
    const {fov, memory} = game.player
    const children: JSX.Element[] = []
    forEachPos((pos, x, y) => {
        // default values for unknown tiles
        let type = 'empty'
        let opacity = 0
        if (fov[pos]) {
            // visible tiles
            if (actors[pos]) {
                type = game.entities[actors[pos]].type
            } else {
                type = types[pos]
            }
            opacity = 1
        } else if (memory[pos]) {
            // remembered tiles
            type = types[pos]
            opacity = 0.5
        }
        children.push(
            <Tile
                key={pos}
                type={type}
                x={x}
                y={y}
                opacity={opacity}
            />
        )
    })
    return <div>{children}</div>
}
