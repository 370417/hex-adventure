/** @file helper functions for working with randomness */

/** return a random integer in the range [min, max] inclusive */
function randint(min: number, max: number, random: () => number) {
    return min + Math.floor((max - min + 1) * random())
}

/** randomly shuffle an array in place */
export function shuffle<T>(array: T[], random: () => number) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random)
        const tempi = array[i]
        array[i] = array[j]
        array[j] = tempi
    }
    return array
}
