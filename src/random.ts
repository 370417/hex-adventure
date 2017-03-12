// Helper functions for working with randomness

function randint(min: number, max: number, random: () => number) {
    return min + Math.floor((max - min + 1) * random())
}


export function shuffle<T>(array: Array<T>, random: () => number): Array<T> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random)
        const tempi = array[i]
        array[i] = array[j]
        array[j] = tempi
    }
    return array
}
