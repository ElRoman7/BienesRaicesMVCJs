import express from "express"
import {inicio, categoria, buscador, noEncontrado} from '../controllers/appController.js'
import identificarUsuario from "../middleware/identificarUsuario.js"

const router = express.Router()

// Página de Inicio
router.get('/',identificarUsuario, inicio )

// Categorías
router.get('/categorias/:id',identificarUsuario, categoria)

// Buscador
router.post('/buscador', identificarUsuario, buscador)
router.get('/buscador',identificarUsuario, buscador)

// 404
router.get('/404', noEncontrado)



export default router;