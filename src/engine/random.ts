import { random, RandState } from '../lib/alea'

/** @file helper functions for working with randomness */

/** return a random integer in the range [min, max] inclusive */
export function randint(min: number, max: number, state: RandState) {
    return min + Math.floor((max - min + 1) * random(state))
}

/** randomly shuffle an array in place */
export function shuffle<T>(array: T[], state: RandState) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, state)
        const tempi = array[i]
        array[i] = array[j]
        array[j] = tempi
    }
    return array
}
