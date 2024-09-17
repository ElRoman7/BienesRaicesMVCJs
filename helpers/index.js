import jwt from 'jsonwebtoken'

const esVendedor = (usuarioId, propiedadUsuarioId) => {
    return usuarioId == propiedadUsuarioId
}

const formatearFecha = fecha => {
    const nuevaFecha = new Date(fecha).toISOString().slice(0,10)

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return new Date(nuevaFecha).toLocaleDateString('es-Es', opciones);
    
}

function isAuthenticated(req) {
    // Obtén el token JWT de las cookies
    const token = req.cookies.jwt;
  
    // Verifica si existe el token
    if (!token) {
      return false;
    }
  
    try {
      // Verifica si el token es válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Si el token es válido, regresa true
      return true;
    } catch (error) {
      // Si hay un error (token inválido o expirado), regresa false
      return false;
    }
  }

export {
    esVendedor,
    formatearFecha,
    isAuthenticated
}