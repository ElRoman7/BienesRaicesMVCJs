import multer from "multer";
import path from 'path';
import { generarId } from '../helpers/tokens.js';
import fs from 'fs';

// Verificar si la carpeta "uploads" existe, y crearla si no
const uploadsPath = './public/uploads/';
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true }); // Crea la carpeta y subcarpetas si es necesario
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsPath); // Usamos la ruta verificada
    },
    filename: function(req, file, cb) {
        cb(null, generarId() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

export default upload;
