export default {
    input: 'src/index.js',
    output: [{
        format: 'es',
        file: 'dist/index.mjs'
    }, {
        format: 'cjs',
        file: 'dist/index.js'
    }]
};