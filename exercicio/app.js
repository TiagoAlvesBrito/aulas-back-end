const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const formidable = require('formidable');
const fs = require('fs');

const bodyParser = require('body-parser');
const { decode } = require('punycode');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const senhaToken = 'IFRN2@23';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'exercicio_backend',
});

connection.connect((error) => {
  if (error) {
    console.log('Erro ao conectar o banco de dados. ', error.message);
  } else {
    console.log('Conectado ao banco de dados com sucesso.');
  }
});

function gerarToken(payload) {
  return jwt.sign(payload, senhaToken, { expiresIn: 20 });
}

function verificarToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({
      mensagemErro:
        'Usuário não autenticado. Faça login antes de chamar este recurso.',
    });
  } else {
    jwt.verify(token, senhaToken, (error, decoded) => {
      if (error) {
        return res
          .status(403)
          .json({ mensagemErro: 'Token inválido. Faça login novamente.' });
      } else {
        const nomeUsuario = decoded.nomeUsuario;
        console.log(`Usuário ${nomeUsuario} autenticado com sucesso.`);
        next();
      }
    });
  }
}

function encriptarSenha(senha) {
  const hash = crypto.createHash('sha256');
  hash.update(senha + senhaToken);
  return hash.digest('hex');
}

app.put('/foto/:id', (req, res) => {
  const id = req.params['id'];
  const formulario = new formidable.IncomingForm();
  formulario.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
    } else {
      const caminhoOriginal = files.arquivo[0].filepath;
      console.log(caminhoOriginal);
      const imagem = fs.readFileSync(caminhoOriginal);
      const sql = 'UPDATE usuarios SET foto = ? WHERE codusuario = ?';
      connection.query(sql, [imagem, id], (err, result) => {
        if (err) {
          res.status(400).json({ mensagem: `Erro ao gravar mensagem. Erro: ${err.message}` });
          //throw err;
        } else {
          //console.log('Imagem gravada com sucesso!');
          res.status(200).json({ mensagem: 'Imagem gravada com sucesso.' });
        }
      });
    }
  });
});

app.get('/foto/:id', (req, res) => {
  const id = req.params['id'];
  const sql = 'SELECT foto FROM usuarios WHERE codusuario = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const foto = result[0].foto;
      const fs = require('fs');
      fs.writeFileSync('foto.jpg', foto);
      //console.log('Imagem recuperada e salva com sucesso!');
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(foto, 'binary');
    } else {
      //console.log('Nenhuma imagem encontrada com o ID fornecido.');
      res.status(404).json({ mensagem: 'Nenhuma imagem encontrada com o ID fornecido.' });
    }
  });
});

app.post('/login', (req, res) => {
  const loginName = req.body.loginName;
  const password = encriptarSenha(req.body.password);
  connection.query(
    'SELECT nomeusuario FROM usuarios WHERE loginname = ? AND password = ?',
    [loginName, password],
    (error, rows) => {
      if (error) {
        console.log('Erro ao processar o comando SQL. ', error.message);
      } else {
        if (rows.length > 0) {
          const payload = { nomeUsuario: rows[0].nomeusuario };
          const token = gerarToken(payload);
          res.json({ acessToken: token });
        } else {
          res.status(403).json({ mensagemErro: 'Usuário ou senha inválidos' });
        }
      }
    }
  );
});

app.post('/usuarios', (req, res) => {
  const nomeUsuario = req.body.nomeUsuario;
  const loginName = req.body.loginName;
  const password = encriptarSenha(req.body.password);
  connection.query(
    'INSERT INTO usuarios (nomeusuario, loginname, password) VALUES(?, ?, ?)',
    [nomeUsuario, loginName, password],
    (error, rows) => {
      if (error) {
        console.log('Erro ao processar o comando SQL. ', error.message);
      } else {
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
      }
    }
  );
});

app.get('/usuarios', verificarToken, (req, res) => {
  connection.query(
    'SELECT codusuario, nomeusuario, loginname FROM usuarios',
    (error, rows) => {
      if (error) {
        console.log('Erro ao processar o comando SQL. ', error.message);
      } else {
        res.json(rows);
      }
    }
  );
});

app.get('/usuarios/:id', verificarToken, (req, res) => {
  const id = req.params['id'];
  connection.query(
    'SELECT codusuario, nomeusuario, loginname FROM usuarios WHERE codusuario = ?',
    [id],
    (error, rows) => {
      if (error) {
        console.log('Erro ao processar o comando SQL. ', error.message);
      } else {
        res.json(rows[0]);
      }
    }
  );
});

app.listen(3000, () => {
  console.log('Servidor de API funcionando na porta 3000');
});
