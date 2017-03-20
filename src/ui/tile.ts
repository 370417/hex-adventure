import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu } from '../data/style'
import * as tiles from '../data/tile'

import React from 'react'

export default function Tile({type, color, x, y, opacity}) {
    const left = (x - (HEIGHT - y - 1) / 2) * xu
    const top = y * smallyu
    const style = {left, top, opacity}
    if (color) {
        style.background = color
    }
    return <div className={`tile ${type}`} style={style} />
}
