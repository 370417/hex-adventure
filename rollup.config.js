export default {
    entry: 'js/index.js',
    format: 'iife',
    dest: 'build/script.js',
    external: ['alea', 'heap'],
    globals: {
        alea: 'Alea',
        heap: 'Heap',
    },
}