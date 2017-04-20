import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu } from '../data/style'

import * as React from 'react'

interface TileProps {
    char: string
    color?: string
    x: number
    y: number
    opacity: number
}

/** renders one map tile */
export default function Tile({char, color, x, y, opacity}: TileProps) {
    const left = (x - (HEIGHT - y - 1) / 2) * xu
    const top = y * smallyu
    const style: any = {left, top, opacity, color}
    return <div className="tile" style={style}>{char}</div>
}
