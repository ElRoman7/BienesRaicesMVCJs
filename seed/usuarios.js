import bcrypt from 'bcrypt';


const usuarios = [
    {
        nombre: 'Sergio',
        email: 'sergio.romam@outlook.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10)
    },
    {
        nombre: 'Sergio',
        email: 'sergioromam5@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password',10)
    }
]

export default usuarios