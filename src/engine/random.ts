import { random, RandState } from '../lib/alea'

/** @file helper functions for working with randomness */

/** return a random integer in the range [min, max] inclusive */
export function randint(min: number, max: number, alea: RandState) {
    return min + Math.floor((max - min + 1) * random(alea))
}

/** randomly shuffle an array in place */
export function shuffle<T>(array: T[], alea: RandState) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, alea)
        const tempi = array[i]
        array[i] = array[j]
        array[j] = tempi
    }
    return array
}
