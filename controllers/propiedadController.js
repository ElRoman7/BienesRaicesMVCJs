import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = (req, res) =>{
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        barra: true 
    })
}

// Formulario para crear una nueva propiedad
const crear = async (req, res) =>{
    // Consultar modelo de Precio y Categorías

    //Se returnan en orden
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]) 

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) =>{
    // Validación
    let resultado = validationResult(req);


    if(!resultado.isEmpty()){
        //Se returnan en orden
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Crear un registro
    const { titulo, 
            descripcion, 
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precio: precioId, //Renombrar variable
            categoria: categoriaId, //Renombrar variable


            } = req.body

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,


        })
    } catch (error) {
        console.log(error);
        
}
    
}

export {
    admin,
    crear,
    guardar
}