import { Dropzone } from 'dropzone';
import { param } from 'express-validator';
// imagen es el id del formulario
const token = document.querySelector('meta[name="csrf-token"]').content

// console.log(token);


Dropzone.options.imagen = {
    dictDefaultMessage: 'Arrastra aquí tus imágenes',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads:1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar Archivo',
    dictMaxFilesExceeded: 'Solo puedes subir 1 archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',  //Viene desde el Post
    init: function(){
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function(){
            dropzone.processQueue()
        })

        dropzone.on('queuecomplete', function() {
            if(dropzone.getActiveFiles().length == 0) {
                window.location.href = '/mis-propiedades'
            }
        })
    }

}