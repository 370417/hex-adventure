export default {
    entry: 'temp/index.js',
    format: 'iife',
    dest: 'docs/script.js',
    external: ['react', 'react-dom'],
    globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
}
