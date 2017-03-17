import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu } from '../data/style'
import * as tiles from '../data/tile'

import React from 'react'

export default function Tile({type, visible, actor, x, y}) {
    const netType = actor && actor.type || type
    const tile = tiles[netType]
    const maskRule = `url(tileset.png) ${-tile.x}em ${-tile.y}rem`
    const realx = (x - (HEIGHT - y - 1) / 2) * xu
    const realy = y * smallyu
    const opacity = visible ? 1 : 0.5
    const style = {
        opacity,
        left: realx + 'px',
        top: realy + 'px',
        mask: maskRule,
        WebkitMask: maskRule,
        background: tile.color,
    }
    return <div className={`tile`} style={style} />
}
