const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // Importe o pacote cors
const sql = require('mssql');
const port = 3000;
var timestamp = 0
app.use(cors());
app.use(bodyParser.json());


const config = {
    driver: 'ODBC Driver 17 for SQL Server',
    server: '192.168.0.102\\KALEOSERVER2',
    database: 'tempdb',
    user: 'kaleologin',
    password: 'Gislaine470@'
};


app.post('/inserir_dados', async (req, res) => {
    try {
        // Desestruturando os dados do corpo da requisição
        const { query } = req.body;
        
        // Conectando ao banco de dados
        await sql.connect(config);

        // Definindo a consulta SQL de inserção

        console.log(query)

        // Executando a consulta de inserção
        await sql.query(query);

        console.log('Valores inseridos com sucesso na tabela.');
        res.sendStatus(200);
    } catch (error) {
        console.error('Erro ao inserir valores na tabela:', error);
        res.sendStatus(500);
    } finally {
        // Fechando a conexão com o banco de dados
        await sql.close();
    }

})

app.get('/clientes', async (req, res) => {
    try {
        // Conectar ao banco de dados
        await sql.connect(config);

        // Definir a consulta SQL para buscar todos os clientes
        const query = 'SELECT * FROM TABLETK2'; // Supondo que a tabela de clientes se chama "clientes"

        // Executar a consulta SQL
        const result = await sql.query(query);

        // Enviar os resultados de volta ao cliente
        res.json({ clientes: result.recordset });
    } catch (error) {
        console.error('Erro ao listar os clientes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        // Fechar a conexão com o banco de dados
        await sql.close();
    }
});



// Rota para a página inicial
app.get('/home', (req, res) => {
  res.send('Bem-vindo à página inicial!');
});


// Porta para o servidor escutar
const PORT = process.env.PORT || 9002;

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
