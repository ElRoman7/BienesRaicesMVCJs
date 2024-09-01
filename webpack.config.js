import path from 'path'

export default {
    mode: 'development',
    entry: {
        mapa: './src/js/mapa.js',
        agregarImagen: './src/js/agregarImagen.js',
        alertaEliminarPropiedad: './src/js/alertaEliminarPropiedad.js',
        mostrarMapa: './src/js/mostrarMapa.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve('public/js')
    }
}