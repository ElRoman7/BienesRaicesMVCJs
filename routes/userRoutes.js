import express, { Router } from "express";
import { formularioLogin, formularioOlvidePassword, formularioRegistro, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, autenticar, cerrarSesion, miPerfil } from "../controllers/usuarioController.js";
import protegerRuta from "../middleware/protegerRuta.js"
import identificarUsuario from '../middleware/identificarUsuario.js'

const router = express.Router();

// Rutas
router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar)

// Cerrar Sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password' ,formularioOlvidePassword);
router.post('/olvide-password' ,resetPassword);

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);

router.get('/mi-perfil', protegerRuta, identificarUsuario ,miPerfil);



export default router;