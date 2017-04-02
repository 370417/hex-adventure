import { forEachPos } from '../engine/level'
import { Game } from '../engine/game'

import Tile from './tile'

import * as React from 'react'

/** renders all map tiles */
export default function Grid({game}: {game: Game}) {
    const {tiles, mobs} = game.level
    // const {fov, memory} = game.player
    const fov = game.components.fov[game.player]
    const memory = game.components.memory[game.player]
    const children: JSX.Element[] = []
    forEachPos((pos, x, y) => {
        // default values for unknown tiles
        let type = 'empty'
        let opacity = 0
        if (fov[pos]) {
            // visible tiles
            if (mobs[pos]) {
                type = game.components.behavior[mobs[pos]]
            } else {
                type = tiles[pos]
            }
            opacity = 1
        } else if (memory[pos]) {
            // remembered tiles
            type = memory[pos]
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
