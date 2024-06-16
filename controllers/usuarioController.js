import { check, validationResult, body } from 'express-validator';
import Usuario from '../models/Usuario.js'
import { generarId } from '../helpers/tokens.js';
import { emailOlvidePassword, emailRegistro } from '../helpers/emails.js'
import { where } from 'sequelize';

const formularioLogin =  (req, res) => {
    res.render('auth/login',{
        pagina: 'Iniciar Sesión'
        
    });
    
}

const formularioRegistro =  (req, res) => {

    res.render('auth/registro',{
        pagina : 'Crear Cuenta',
        csrfToken : req.csrfToken()
    });
}

const registrar = async (req,res) => {
    // console.log('Registrando');
    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre es Obligatorio').run(req);
    await check('email').isEmail().withMessage('El email es Incorrecto').run(req);
    await check('password').isLength({min:6}).withMessage('El password debe ser de al menos 6 caracteres').run(req);
    // Comparar repetir_password con password
    await body('repetir_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Los passwords No son Iguales')
    .run(req);

    let resultado = validationResult(req);


    // Verificar Resultado vacío
    // return res.json(resultado.array())
    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina : 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario:{
                nombre : req.body.nombre,
                email : req.body.email,
            }
        });
    }

    // Extraer los datos 
    const { nombre, email, password } = req.body
    


    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where: { email }});

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina : 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya está registrado'}],
            usuario:{
                nombre : nombre,
                email : email,
            }
        });
    }

    console.log(existeUsuario);
    // Almacenar Usuario
    const usuario = await Usuario.create({
        nombre,
        email, 
        password,
        token: generarId()
    });

    // Envia Email de Confirmacion
    emailRegistro({
        nombre : usuario.nombre,
        email : usuario.email,
        token  : usuario.token
    })


    // Mostrar Mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada correctamente',
        mensaje: 'Hemos enviado un email de confimacion, presiona el enlace'
    })
}


const confirmar = async (req, res, next) => {
    const { token } = req.params;
    
    // Verificar si el token es válido
    
    const usuario = await Usuario.findOne({where: {token}});
    console.log(usuario);

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmar Cuenta

    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();
    console.log(usuario);

    res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó Correctamente',
        error: false
    })
    
}

const formularioOlvidePassword =  (req, res) => {
    res.render('auth/olvide-password',{
        pagina : 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(), 
    });
}

const resetPassword = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('El email es Incorrecto').run(req);

    let resultado = validationResult(req);

    // Verificar Resultado vacío
    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password', {
            pagina : 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(), 
            errores: resultado.array()
        });
    }

    // Buscar el usuario
    const { email } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina : 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(), 
            errores: [{ msg: 'El Email o Usuario no está registrado' }],
        });
    }

    // Generar Token y enviar el Email
    usuario.token = generarId();
    await usuario.save();

    emailOlvidePassword({
        email : usuario.email,
        nombre : usuario.nombre,
        token: usuario.token
    });

    // Mostrar Mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu contraseña',
        mensaje: 'Hemos enviado un email para reestablecer tu contraseña, presiona el enlace'
    });
}


const comprobarToken = (req, res) => {

}

const nuevoPassword = (req, res) => {
    
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}