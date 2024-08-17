import bcrypt from 'bcrypt';


const usuarios = [
    {
        nombre: 'Sergio',
        email: 'sergio.romam@outlook.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10)
    }
]

export default usuarios