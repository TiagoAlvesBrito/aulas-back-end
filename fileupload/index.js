const express = require('express');
const formidable = require('formidable');
const fs = require('fs')

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Servidor funcionando...');
});

app.post('/arquivo', (req, res) => {
    const formulario = new formidable.IncomingForm();
    formulario.parse(req, (error, fields, files) => {
        const caminhoOriginal = files.arquivo.filepath;
        const caminhoNovo = __dirname + '\\arquivos\\' + files.arquivo.originalFilename; //dirname - diretório que a minha aplicação está rodando
        fs.renameSync(caminhoOriginal, caminhoNovo);
    });
    res.send('Arquivo gravado com sucesso');
});

app.listen(port, () => {
    console.log(`Servidor funcinando na porta ${port}`);
});