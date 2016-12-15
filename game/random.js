// Helper functions for working with randomness

function randint(min, max, random) {
    return min + Math.floor((max - min + 1) * random());
}


function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i, random);
        const tempi = array[i];
        array[i] = array[j];
        array[j] = tempi;
    }
    return array;
}
