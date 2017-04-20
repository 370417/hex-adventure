import { Components } from '../engine/components'

import Mob from './mob'

import * as React from 'react'

interface MobsProps {
    schedule: number[]
    components: Components
}

export default function Mobs({schedule, components}: MobsProps) {
    const children: JSX.Element[] = []
    for (let i = 0; i < schedule.length; i++) {
        const entity = schedule[i]
        if (components.position[entity] !== undefined) {
            children.push(
                <Mob
                    key={entity}
                />
            )
        }
    }
}
