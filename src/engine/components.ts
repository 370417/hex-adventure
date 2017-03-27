import { Behavior } from './behavior'

/** @file Specifies component types */

export type Components = {
    [Component in keyof Entity]: {[entity: number]: Entity[Component]}
}

interface Entity  {
    position: number
    behavior: Behavior
    fov: {[pos: number]: boolean}
    memory: {[pos: number]: string}
}
