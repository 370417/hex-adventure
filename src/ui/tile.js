import { WIDTH, HEIGHT } from '../data/constants'
import { xu, smallyu } from '../data/style'

import React from 'react'

export default function Tile({type, x, y}) {
    const realx = (x - (HEIGHT - y - 1) / 2) * xu
    const realy = y * smallyu
    const style = {
        left: realx + 'px',
        top: realy + 'px',
    }
    return <div className={`tile ${type}`} style={style} />
}
