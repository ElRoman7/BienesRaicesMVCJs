import { check, validationResult, body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js';
import { emailOlvidePassword, emailRegistro } from '../helpers/emails.js'

const formularioLogin =  (req, res) => {
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken(), 
        
    });
    
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage('El email es Incorrecto').run(req);
    await check('password').notEmpty().withMessage('La contraseña es Obligatoria').run(req);

    let resultado = validationResult(req);

    // Validar formulario

    if(!resultado.isEmpty()){
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // Comprobar si el usuario existe

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        });
    }

    // Comprobar si el usuario si está confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        });
    }

    // Revisar el Password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es Incorrecto'}]
        });
    }

    // Autenticar el usuario
    const token = generarJWT({id:usuario.id, nombre:usuario.nombre});

    console.log(token);

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true, //Para certificado SSL
    }).redirect('/mis-propiedades');
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


const comprobarToken = async (req, res) => {
    
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}});
    console.log(usuario);

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Restablece tu Contraseña',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        });
    }

    // Mostrar formulario para modificar password
    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken()
    })

}

const nuevoPassword = async (req, res) => {
    await check('password').isLength({min:6}).withMessage('El password debe ser de al menos 6 caracteres').run(req);
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        return res.render('auth/reset-password',{
            pagina : 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    const { token } = req.params
    const { password } = req.body
    const usuario = await Usuario.findOne({where: {token}})
    console.log(usuario);

    // Hashear el nuevo Password (Se hashea aqui y no desde el modelo porque si se actualiza cualquier otra cosa se actualiza tambien el password hasheado y se vuelve a hashear)
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardó correctamente'
    })

    console.log('Guardando el Password');
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}