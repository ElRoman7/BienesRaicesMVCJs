import { Precio, Categoria, Propiedad } from '../models/index.js'

const inicio = async (req, res) => {

    const [ categorias, precios, casas, departamentos ] = await Promise.all([
        Categoria.findAll({raw : true}),
        Precio.findAll({raw : true}),
        Propiedad.findAll(
            {
                limit: 3,
                where:{
                    categoriaId : 1
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
                    categoriaId : 2
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
        Propiedad.findAll(
            {
                limit: 3,
                where:{
                    categoriaId : 3
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
        )
    ])

    console.log(categorias);
    

    res.render('inicio',{
        pagina: 'Inicio',
        categorias,
        precios,
        casas, 
        departamentos
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
        const limit = 6;
        const offset = (paginaActual - 1) * limit;

        // Obtener propiedades y total de la categoría en paralelo
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: { categoriaId: id },
                include: [{ model: Precio, as: 'precio' }]
            }),
            Propiedad.count({ where: { categoriaId: id } })
        ]);

        const paginas = Math.ceil(total / limit);

        // Redirigir si la página solicitada excede el número de páginas disponibles
        if(total != 0){
            if (paginaActual > paginas) {
                return res.redirect(`/categorias/${id}?pagina=1`);
            }
        }

        // Renderizar la vista con los datos obtenidos
        res.render('categoria', {
            pagina: `${categoria.nombre}s en Venta`,
            propiedades,
            total,
            offset,
            limit,
            paginaActual,
            paginas,
            baseUrl: `/categorias/${id}`
        });
        
    } catch (error) {
        console.error('Error al cargar la categoría:', error);
        res.status(500).send('Error interno del servidor');
    }
};


const noEncontrado = (req, res) => {
    
}

const buscador = (req, res) => {
    
}

export{
    inicio,
    categoria,
    noEncontrado,
    buscador
}