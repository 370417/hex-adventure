import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu } from '../data/style'
import * as tiles from '../data/tile'

import * as React from 'react'

interface TileProps {
    type: string
    color?: string
    x: number
    y: number
    opacity: number
}

/** renders one map tile */
export default function Tile({type, color, x, y, opacity}: TileProps) {
    const left = (x - (HEIGHT - y - 1) / 2) * xu
    const top = y * smallyu
    const style: any = {left, top, opacity}
    if (color) {
        style.background = color
    }
    return <div className={`tile ${type}`} style={style} />
}
