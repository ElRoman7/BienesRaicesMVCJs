import { Dropzone } from 'dropzone';
// imagen es el id del formulario
const token = document.querySelector('meta[name="csrf-token"]').content

console.log(token);


Dropzone.options.imagen = {
    dictDefaultMessage: 'Arrastra aquí tus imágenes',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads:1,
    autoProcessQueue: true,
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar Archivo',
    dictMaxFilesExceeded: 'Solo puedes subir 1 archivo',
    headers: {
        'CSRF-Token': token
    }


}