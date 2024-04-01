const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
let timestamp = 0; // Corrigido para ser uma variável let

app.use(cors());
app.use(bodyParser.json());

const connectionUri = process.env.DATABASE_URL || 'mysql://seu_usuario:sua_senha@seu_host:3306/seu_banco_de_dados';

async function connect() {
    try {
        const connection = await mysql.createConnection(connectionUri);
        console.log('Conexão bem-sucedida ao banco de dados MySQL!');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar-se ao banco de dados:', error);
        throw error;
    }
}

app.post('/atualiza_cadastros', async (req, res) => {
    let connection;
    try {
        const { email } = req.body;
        const query = `DELETE FROM TABLETK2 WHERE email = '${email}' AND code <> 1`;
        connection = await connect();
        await connection.execute(query);
        console.log(`Email ${email} retirado da lista`);
        res.status(200).send('Cadastros atualizados com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar cadastros:', error.message);
        res.status(500).send('Ocorreu um erro ao atualizar cadastros.');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

app.post('/inserir_dados', async (req, res) => {
    try {
        const { query } = req.body;
        const connection = await connect();
        await connection.execute(query);
        console.log('Valores inseridos com sucesso na tabela.');
        res.sendStatus(200);
    } catch (error) {
        console.error('Erro ao inserir valores na tabela:', error);
        res.sendStatus(500);
    } finally {
        await connection.end();
    }
});

app.post('/verificar_email', async (req, res) => {
    try {
        const connection = await connect();
        const { query_email } = req.body;
        const result = await connection.execute(query_email);
        res.json({ result: result });
    } catch (error) {
        console.error('Erro ao verificar o email:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await connection.end();
    }
});

app.post('/verificar_codigo', async (req, res) => {
    try {
        const { codigo } = req.body;
        const query_code = `SELECT COUNT(*) AS count FROM TABLETK2 WHERE code = '${codigo}'`;
        const connection = await connect();
        const result = await connection.execute(query_code);
        const rowCount = result.recordset[0].count;
        res.json({ result: result });
        if (rowCount > 0) {
            const query_subs = `UPDATE TABLETK2 SET code = '1' WHERE code = '${codigo}'`;
            await connection.execute(query_subs);
        } 
    } finally {
        await connection.end();
    }
});

app.post('/verificar_login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const query_code = `SELECT * FROM TABLETK2 WHERE email = '${email}' AND senha = '${senha}'`;
    
        const connection = await connect();
        const result = await connection.execute(query_code);
        const rowCount = result.recordset.length;
        
        if (rowCount > 0) {
            timestamp = Date.now();
            res.json({ success: true, timestamp });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Erro ao verificar o login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/menos_download', async (req, res) => {
    try {
        const { email } = req.body;
        const queryUpdate = `UPDATE TABLETK2 SET donwload = donwload - 1 WHERE email = '${email}'`;
        const connection = await connect();
        await connection.execute(queryUpdate);
        const querySelect = `SELECT donwload FROM TABLETK2 WHERE email = '${email}'`;
        const result = await connection.execute(querySelect);
        const novoDownload = result.recordset[0].donwload;
        res.json({ success: true, novoDownload });
    } catch (error) {
        console.error('Erro ao decrementar o donwload:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

app.post('/get_downloads', async (req, res) => {
    try {
        const { email } = req.body;
        const connection = await connect();
        const querySelect = `SELECT donwload FROM TABLETK2 WHERE email = '${email}'`;
        const result = await connection.execute(querySelect);
        const novoDownload =result;
        res.json({ success: true, novoDownload });
    } catch (error) {
        console.error('Erro ao decrementar o donwload:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
    
});

app.get('/clientes', async (req, res) => {
    try {
        const connection = await connect();
        const [rows, fields] = await connection.execute('SELECT * FROM TABLETK2');
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).send('Erro ao executar a consulta: ' + error.message);
    }
});

app.get('/clientes/criar', async (req, res) => {
    try {
        const connection = await connect();
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS TABLETK2 (
                cliente VARCHAR(255),
                cpf VARCHAR(11),
                email VARCHAR(255),
                code VARCHAR(255),
                download INT
            )
        `);
        await connection.execute(`
            INSERT INTO TABLETK2 (cliente, cpf, email, code, donwload)
            VALUES ('Exemplo Cliente', '12345678901', 'exemplo@email.com', '123ABC', -5)
        `);
        await connection.end();
        res.send('Tabela TABLETK2 criada e exemplo de cliente inserido com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao criar tabela TABLETK2 e inserir exemplo de cliente: ' + error.message);
    }
});

app.get('/home', (req, res) => {
    res.send('Bem-vindo à página inicial!');
});

const PORT = process.env.PORT || 9001;

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
