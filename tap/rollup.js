export default {
    input:'src/index.js',
    output:[{
        format:'es',
        file:'dist/index.mjs'
    },{
        format:'es',
        file:'dist/module.js'
    },{
        format:'cjs',
        file:'dist/index.js'
    }]
}