import express from "express"
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen } from "../controllers/propiedadController.js"
import protegerRuta from "../middleware/protegerRuta.js"


const router = express.Router()


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

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)


export default router