const express = require('express');
const mysql = require('mysql');
const app = express();

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
})

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