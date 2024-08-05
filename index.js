import express from 'express';
import userRoutes from './routes/userRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import db from './config/db.js';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';



// Crear App
const app = express();

// Habilitar Body-Parser
app.use(bodyParser.urlencoded({extended:true})); 
app.use(bodyParser.json()); 

app.use(cookieParser());

app.use(csrf({cookie: true}));

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log('Conexion Correcta a la base de datos');
} catch (error) {
    console.log(error);

} 

// Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta Pública
app.use(express.static('public'));

// Routing
app.use('/auth', userRoutes);
app.use('/', propiedadesRoutes);




const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`);
})