import Categoria from './Categoria.js';
import Precio from './Precio.js';
import Propiedad from './Propiedad.js';
import Usuario from './Usuario.js';

//Has One se lee de derecha a izquierda, Belongs To normal
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'});
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'});
Propiedad.belongsTo(Usuario, {foreignKey: 'usuarioId'});


export{
    Propiedad,
    Precio,
    Categoria,
    Usuario
}