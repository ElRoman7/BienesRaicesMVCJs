import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = (req, res) =>{
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
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
            imagen: ''


        });
        
        const {id} = propiedadGuardada;
        res.redirect(`propiedades/agregar-imagen/${id}`)


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

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen
}