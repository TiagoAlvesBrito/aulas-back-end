const express = require('express')
const mysql = require('mysql'); //npm install mysql2 --save
const app = express()
const jwt = require('jsonwebtoken')
const port = 3000

app.use(express.json()); //Para a api saber tratar os json
const MinhaSenha = 'ifrn2@23';

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbbiblioteca'
});

app.post('/login', (req, res) => {
    if (req.body.usuario === 'luiz' && req.body.senha === '123') {
        const id = 1;
        const nome = 'Luiz Ferreira';
        const grupo = 'Gerente';
        const token = jwt.sign({ id, nome, grupo }, MinhaSenha, { expiresIn: '5m' });
        res.json({ auth: true, token: token });
    } else {
        res.status(403).json({ message: 'Login Inválido!' });
    }
});

function verificarToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({ auth: false, message: 'Nenhum token de autenticação informado.' });
    } else {
        jwt.verify(token, MinhaSenha, function (err, decoded) {
            if (err) {
                res.status(500).json({ auth: false, message: 'Token inválido.' });
            } else {
                console.log('Metodo acessado por ' + decoded.nome)
                next();
            }
        });
    }
}

con.connect((err) => {
    if (err) {
        throw err;
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/alunos', (req, res) => {
    res.send('{"nome":"Tiago"}');
})

app.post('/alunos', (req, res) => {
    res.send('Executou um post');
})

app.get('/alunos/:id', (req, res) => {
    const id = req.params.id;
    if (id <= 10) {
        res.status(200).send('Aluno localizado com sucesso');
    }
    else {
        res.status(404).send('Aluno não encontrado');
    }
})

app.get('/autor', verificarToken, (req, res) => {
    con.query('SELECT * FROM tbAutor', (err, result, fields) => {
        if (err) {
            throw err;
        }
        console.log(result);
        res.status(200).send(result);
    });
});

app.get('/autor/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM tbautor WHERE idautor = ?';
    con.query(sql, [id], (err, result, fields) => { //No lugar da interrogação, vai entrar o que está em []
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            res.status(200).send(result);
        }
        else {
            res.status(404).send('Autor não encontrado');
        }
    });
});

//Para excluir um autor:

app.delete('/autor/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM tbautor WHERE idautor = ?';
    con.query(sql, [id], (err, result, fields) => { //No lugar da interrogação, vai entrar o que está em []
        if (err) {
            throw err;
        }
        if (result.affectedRows > 0) {
            res.status(200).send('Registro excluído com sucesso');
        }
        else {
            res.status(404).send('Autor não encontrado');
        }
    });
})

app.post('/autor', (req, res) => {
    const idautor = req.body.idautor;
    const noautor = req.body.noautor;
    const idnacionalidade = req.body.idnacionalidade;

    const sql = 'INSERT INTO tbAutor (IdAutor, NoAutor, IdNacionalidade) VALUES (?, ?, ?)';
    con.query(sql, [idautor, noautor, idnacionalidade], (err, result, fields) => { //No lugar da interrogação na linha acima, vai entrar o que está em []
        if (err) {
            throw err;
        }
        if (result.affectedRows > 0) {
            res.status(200).send('Autor incluído com sucesso');
        }
        else {
            res.status(400).send('Erro ao incluir o registro');
        }
    });
})

app.put('/autor/:id', (req, res) => {
    const id = req.params.id;
    const noautor = req.body.noautor;
    const idnacionalidade = req.body.idnacionalidade;

    const sql = 'UPDATE tbAutor SET NoAutor = ?, IdNacionalidade = ? WHERE IdAutor = ?';
    con.query(sql, [noautor, idnacionalidade, id], (err, result, fields) => { //No lugar da interrogação, vai entrar o que está em []
        if (err) {
            throw err;
        }
        if (result.affectedRows > 0) {
            res.status(200).send('Registro atualizado com sucesso');
        }
        else {
            res.status(400).send('Autor não encontrado');
        }
    });
})


app.listen(port, () => {
    console.log(`O servidor está ouvindo na porta ${port}`);
})