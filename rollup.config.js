import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
    entry: 'temp/index.js',
    format: 'iife',
    dest: 'docs/script.js',
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
            // 'process.env.NODE_ENV': JSON.stringify('production')
        }),
        commonjs(),
        nodeResolve({
            jsnext: true,
        }),
    ],
}