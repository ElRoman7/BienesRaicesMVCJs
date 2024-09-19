import { Sequelize } from 'sequelize'
import { Precio, Categoria, Propiedad } from '../models/index.js'
import { isAuthenticated } from '../helpers/index.js';

const inicio = async (req, res) => {

    const categorias = Categoria.findAll({raw : true})
    const precios = Precio.findAll({raw : true});

    const [casas, departamentos ] = await Promise.all([
        Propiedad.findAll(
            {
                limit: 3,
                where:{
                    categoriaId : 1,
                    publicado : 1
                },
                include :[
                    {
                        model: Precio,
                        as: 'precio'
                    }
                ],
                order: [['createdAt','DESC']]
            }
        ),
        Propiedad.findAll(
            {
                limit: 3,
                where:{
                    categoriaId : 2,
                    publicado : 1
                },
                include :[
                    {
                        model: Precio,
                        as: 'precio'
                    }
                ],
                order: [
                    ['createdAt','DESC']
                ]
            }
        ),
    ])

    // console.log(categorias);
    const autenticado = req.usuario == null ? false : true;

    res.render('inicio',{
        pagina: 'Inicio',
        categorias,
        precios,
        casas, 
        departamentos,
        csrfToken: req.csrfToken(),
        autenticado
    })
}


const categoria = async (req, res) => {
    const { id } = req.params;
    let { pagina: paginaActual = 1 } = req.query; // Valor por defecto a 1

    // Validar que paginaActual sea un número entero
    paginaActual = Number(paginaActual);
    if (isNaN(paginaActual) || paginaActual < 1) {
        return res.redirect(`/categorias/${id}?pagina=1`);
    }

    // Comprobar que la categoría exista antes de continuar
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
        return res.redirect('/404');
    }

    try {
        // Parámetros para la paginación
        const limit = 12;
        const offset = (paginaActual - 1) * limit;

        // Obtener propiedades y total de la categoría en paralelo
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: { categoriaId: id, publicado : 1 },
                include: [{ model: Precio, as: 'precio' }]
            }),
            Propiedad.count({ where: { categoriaId: id, publicado : 1 } })
        ]);

        const paginas = Math.ceil(total / limit);

        // Redirigir si la página solicitada excede el número de páginas disponibles
        if(total != 0){
            if (paginaActual > paginas) {
                return res.redirect(`/categorias/${id}?pagina=1`);
            }
        }

        const autenticado = req.usuario == null ? false : true;

        // Renderizar la vista con los datos obtenidos
        res.render('categoria', {
            pagina: `${categoria.nombre}s en Venta`,
            propiedades,
            total,
            offset,
            limit,
            paginaActual,
            paginas,
            baseUrl: `/categorias/${id}`,
            csrfToken: req.csrfToken(),
            autenticado
        });

    } catch (error) {
        console.error('Error al cargar la categoría:', error);
        res.status(500).send('Error interno del servidor');
    }
};


const noEncontrado = (req, res) => {
    res.render('404',{
        pagina: 'No Encontrada',
        csrfToken: req.csrfToken(),
    })
} 

const buscador = async (req, res) => {
    const { termino } = req.body

    // Validar que termino no sea vacío
    if(!termino.trim()){
        res.redirect('back');
    }

    // Consultar Propiedades
    const propiedades = await Propiedad.findAll({
        where : {
            publicado : 1,
            titulo :{
                [Sequelize.Op.like] : '%' + termino + '%'
            }
        },
        include: [
            {model: Precio, as: 'precio'}
        ]
    });
    const autenticado = req.usuario == null ? false : true;

    res.render('busqueda', {
        pagina: 'Resultados de la Búsqueda',
        propiedades,
        csrfToken: req.csrfToken(),
        autenticado
    })

}

export{
    inicio,
    categoria,
    noEncontrado,
    buscador
}