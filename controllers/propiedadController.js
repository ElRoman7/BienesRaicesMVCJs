import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import {unlink} from 'node:fs/promises'
import { esVendedor, formatearFecha } from '../helpers/index.js';
import fs from 'fs';
import path from 'path';

const admin = async (req, res) =>{

    //* Paginación con query string
    // Leer Query String
    const {pagina : paginaActual} = req.query //Renombrar variable
    // Expresion Regular, solo se admiten de 0 a 9
    const expresion = /^[0-9]$/;
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
                    },
                    {
                        model: Mensaje, as: 'mensajes'
                    }
                ]
            }),
            Propiedad.count({
                where: {usuarioId : id} 
            })
        ])

        const paginas = Math.ceil(total/limit);

        if(total > 0){
            if(paginaActual > paginas) {
                res.redirect('/mis-propiedades?pagina=1')
            }
        }

        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas,
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit,
            baseUrl: '/mis-propiedades'
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

        // console.log(req.usuario);

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

const editarImagen = async (req, res) => {
    const{id} = req.params //Obtenemos la variable id que pusimos en la url
   
    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // validar que no esté publicada
    // if(propiedad.publicado){
    //     return res.redirect('/mis-propiedades');
    // }
    // Validar que la propiedad pertenece a quien visita la pagina
    
    if(propiedad.usuarioId.toString() != req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/editar-imagen',{
        pagina: `Editar Imagen: ${propiedad.titulo}`,
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
    // if(propiedad.publicado){
    //     return res.redirect('/mis-propiedades');
    // }
    // Validar que la propiedad pertenece a quien visita la pagina
    
    if(propiedad.usuarioId.toString() != req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    try {
        // Verificar si ya hay una imagen existente
        if (propiedad.imagen) {
            // Ruta completa de la imagen existente
            const oldImagePath = path.join(`./public/uploads/${propiedad.imagen}`);
            
            // Eliminar la imagen existente si existe
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            console.log('Imagen Eliminada');
            
        }
        // Almacenar la imagen y publicar propiedad
        
        propiedad.imagen = req.file.filename;
        console.log(propiedad.imagen);
        
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

            // // Si se ha subido una imagen, actualiza la URL de la imagen
            // if (req.file) {
            //     propiedad.imagen = req.file.filename;
            // }

            await propiedad.save();
            // next();

            res.redirect(`/mis-propiedades`);
    
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

// Modifica el Estado de la Propiedad
const cambiarEstado = async(req, res) => {
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

    // Actualizar Propiedad
    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: true
    })
    
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

    const autenticado = req.usuario == null ? false : true;

    // Revisar que exista la propiedad
    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404');
    }
    
    
    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        autenticado
    })
}

const enviarMensaje = async (req, res) => {
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

    let resultado = validationResult(req);


    if(!resultado.isEmpty()){
        return res.render('propiedades/mostrar',{
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
    }

    const { mensaje } = req.body
    const { id : propiedadId  } = req.params
    const { id : usuarioId } = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')
}

// Leer mensajes recibidos
const verMensajes = async (req,res) => {
    // id que está en la ruta
    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include:[
            {
                model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            },
        ]
    })

    // Revisar que exista la propiedad
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    // Revisar que quien visita la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/mensajes',{
        pagina:'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })



}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    editarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
}