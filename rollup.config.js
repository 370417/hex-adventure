export default {
    entry: 'src/index.js',
    format: 'iife',
    dest: 'docs/script.js',
    external: ['alea', 'heap'],
    treeshake: false,
    globals: {
        alea: 'Alea',
        heap: 'Heap',
    },
}