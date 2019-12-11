import node from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: [{
        format: 'es',
        file: 'dist/index.mjs'
    }, {
        format: 'cjs',
        file: 'dist/index.js'
    }],
    plugins: [node(), cjs()]
};