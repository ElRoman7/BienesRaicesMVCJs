import {exit} from 'node:process'
import categorias from "./categorias.js";
import db from "../config/db.js";
import precios from './precio.js';
import {Categoria, Precio} from '../models/index.js';


const importarDatos = async() => {
    try {
        // Autenticar
        await db.authenticate()

        // Generar las columnas
        await db.sync()

        // Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])

        console.log('Datos Importados Correctamente');
        exit(0)

    } catch (error) {
        console.log(error);
        exit(1);
    }
}

const eliminarDatos = async () =>{
    try {
        // Autenticar
        await db.authenticate()

        // Generar las columnas
        await db.sync()

        // Eliminamos los los datos //Hay 2 opciones
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ]);
        await db.sync({force: true})

        console.log('Datos Eliminados Correctamente');
        exit(0)

    } catch (error) {
        console.log(error);
        exit(1);
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
}

if(process.argv[2] === "-d"){
    eliminarDatos();
}