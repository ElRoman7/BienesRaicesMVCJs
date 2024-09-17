import express from "express"
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado ,mostrarPropiedad, enviarMensaje, verMensajes } from "../controllers/propiedadController.js"
import protegerRuta from "../middleware/protegerRuta.js"
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'


const router = express.Router()

// router.get('/', (req, res) => {
//     res.redirect('/mis-propiedades');
// });

router.get('/mis-propiedades', protegerRuta, admin)

router.get('/propiedades/crear',protegerRuta, crear)
router.post('/propiedades/crear', 
    protegerRuta, //MiddleWare Para proteger la ruta si  no hay login  
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción no puedde ir vacía')
        .isLength({max: 1000}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un Rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar //Funcion de guardar en el controlador de propiedadController
);

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);
router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
);

router.get('/propiedades/editar/:id', protegerRuta,
    editar
);

router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción no puedde ir vacía')
        .isLength({max: 1000}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un Rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios //Funcion de editar en el controlador de propiedadController
);

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
);

router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

// Area Pública
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)

// Almacenar los mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min:10}).withMessage('El mensaje no puede ir vacío o es muy corto'),
    body('mensaje').isLength({max:300}).withMessage('El mensaje es muy largo, máximo 300 caracteres'),
    enviarMensaje
)

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)

export default router