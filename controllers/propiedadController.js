import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'
import {unlink} from 'node:fs/promises'

const admin = async (req, res) =>{

    //* Paginación con query string
    // Leer Query String
    const {pagina : paginaActual} = req.query //Renombrar variable
    // Expresion Regular, solo se admiten de 0 a 9
    const expresion = /^[1-9]$/;
    // Validar Query String
    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.usuario;

        // Limites y offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId : id
                },
                include:[
                    {
                        model: Categoria, as: 'categoria'
                    },
                    {
                        model: Precio, as: 'precio'
                    }
                ]
            }),
            Propiedad.count({
                where: {usuarioId : id} 
            })
        ])

        console.log(total);
        
    
        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
        })
    } catch (error) {
        console.log(error);
    }
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
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    //? Crear un registro

    //Traer los datos del req
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

        console.log(req.usuario);

        const {id: usuarioId} = req.usuario
        

    try {
        // Crear la Propiedad
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
            usuarioId,
            categoriaId,
            imagen: ''


        });
        
        const {id} = propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`)


    } catch (error) {
        console.log(error);
        
}
    
}

const agregarImagen = async (req, res) => {
    const{id} = req.params //Obtenemos la variable id que pusimos en la url
   
    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // validar que no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }
    // Validar que la propiedad pertenece a quien visita la pagina
    
    if(propiedad.usuarioId.toString() != req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken(),
    } );
}

const almacenarImagen = async (req, res, next) => {
    const{id} = req.params //Obtenemos la variable id que pusimos en la url
   
    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // validar que no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }
    // Validar que la propiedad pertenece a quien visita la pagina
    
    if(propiedad.usuarioId.toString() != req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    try {
        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next()
        
    } catch (error) {
        console.log(error);
    }
}

const editar = async(req, res) =>{

    // id que está en la ruta
    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    // Revisar que exista la propiedad
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // Revisar que quien visita la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) =>{

    // Verificar la validación
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        //Se returnan en orden
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/editar', {
            pagina: `Editar Propiedad`,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // id que está en la ruta
    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    // Revisar que exista la propiedad
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // Revisar que quien visita la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }
    // Reescribir el objeto y actualizarlo

    try {
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

            propiedad.set({
                titulo, 
                descripcion, 
                habitaciones,
                estacionamiento,
                wc,
                calle,
                lat,
                lng,
                precioId,
                categoriaId
            })

            await propiedad.save();

            res.redirect('/mis-propiedades');
    
    } catch (error) {
        console.log(error);
    }
}

const eliminar = async(req,res) => {
    // id que está en la ruta
    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    // Revisar que exista la propiedad
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // Revisar que quien visita la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // Eliminar la Propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades');

    // Eliminar la Imagen
    await unlink(`public/uploads/${propiedad.imagen}`)

}

// Muestra una Propiedad
const mostrarPropiedad = async(req, res) => {
    //* Validar que la propiedad exista
    //? id que está en la ruta
    const {id} = req.params
    //? Cruzar Información de la categoría y precio en base a sus id
    const propiedad = await Propiedad.findByPk(id,{
        include:[
            {
                model: Categoria, as: 'categoria'
            },
            {
                model: Precio, as: 'precio'
            }
        ]
    })

    // Revisar que exista la propiedad
    if(!propiedad){
        return res.redirect('/404');
    }

    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad
}