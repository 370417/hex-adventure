export default {
    entry: 'src/index.js',
    format: 'iife',
    dest: 'docs/script.js',
    external: ['alea', 'heap'],
    globals: {
        alea: 'Alea',
        heap: 'Heap',
    },
}