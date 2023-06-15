const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const bodyParser = require('body-parser');

const app = express();
app.use(cors());
//app.use(bodyParser);

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exercicio_backend'
});

connection.connect((error) => {
    if (error) {
        console.log('Erro ao conectar ao banco de dados. ', error.message);
    }
    else {
        console.log('Conectado ao banco de dados com sucesso');
    }
});

function gerarToken(payload) {
    const senhaToken = 'IFRN2@23';
    return jwt.sign(payload, senhaToken, {expiresIn: 20});
}

app.post('/login', (req, res) => {
    const loginName = req.body.loginName;
    const password = req.body.password;
    connection.query('SELECT nomeusuario FROM usuarios WHERE loginname = ? AND password = ?', [loginName, password], (error, rows) => {
        if (error) {
            console.log('Erro ao processar o comando SQL. ', error.message);
        }
        else {
            if (rows.length > 0) {
                const payload = { nomeUsuario: rows[0].nomeusuario };
                const token = gerarToken(payload);
                res.json({ acessToken: token });
            }
            else {
                res.status(403).json({ mensagemErro: 'Usuário ou senha inválidos' });
            }
        }
    });
});

app.get('/usuarios', (req, res) => {
    connection.query('SELECT codusuario, nomeusuario, loginname FROM usuarios', (error, rows) => {
        if (error) {
            console.log('Erro ao processar o comando SQL. ', error.message);
        }
        else {
            res.json(rows);
        }
    });
});

app.get('/usuarios/:id', (req, res) => {
    const id = req.params['id'];
    connection.query('SELECT codusuario, nomeusuario, loginname FROM usuarios WHERE codusuario = ?', [id], (error, rows) => {
        if (error) {
            console.log('Erro ao processar o comando SQL. ', error.message);
        }
        else {
            res.json(rows[0]);
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});