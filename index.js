const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importe o pacote cors
const app = express();
const mysql = require('mysql2/promise'); // Importe o pacote mysql2/promise
var timestamp = 0




app.use(cors());
app.use(bodyParser.json());

const connectionUri = process.env.DATABASE_URL || 'mysql://uunch59r7rwnctrn:WoOi8ntdSucc98XB63nj@bxhnkswhjrht8ix2vbrf-mysql.services.clever-cloud.com:3306/bxhnkswhjrht8ix2vbrf';
// Função para conectar-se ao banco de dados

async function connect() {
    try {
        // Conecte-se ao banco de dados usando a URI de conexão
        const connection = await mysql.createConnection(connectionUri);

    
        console.log('Conexão bem-sucedida ao banco de dados MySQL!');

        // Retorne a conexão estabelecida
        return connection;
    } catch (error) {
        console.error('Erro ao conectar-se ao banco de dados:', error);
        throw error;
    }
}

connect()

app.use(bodyParser.json());

app.post('/api/inserir_dados', async (req, res) => {
    const connection = await connect();
    try {
        // Desestruturando os dados do corpo da requisição
        const { query } = req.body;
        
        // Conectando ao banco de dados
        

        // Definindo a consulta SQL de inserção

        console.log(query)

        // Executando a consulta de inserção
        await connection.execute(query);

        console.log('Valores inseridos com sucesso na tabela.');
        res.sendStatus(200);
    } catch (error) {
        console.error('Erro ao inserir valores na tabela:', error);
        res.sendStatus(500);
    } finally {
        // Fechando a conexão com o banco de dados
        await connection.end();
    }

})



app.post('/api/verificar_email', async (req, res) => {
    const connection = await connect();
    try {

        const { email } = req.body;
        const query = `SELECT COUNT(*) AS count FROM TABLETK2 WHERE email = ?`;
        const [rows, fields] = await connection.execute(query, [email]);
        const rowCount = rows[0].count;
        res.json({ result:rowCount });
    } catch (error) {
        console.error('Erro ao verificar o email:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
    finally {
        await connection.end();
    }
});


app.post("/api/atualiza_cadastros", async (req, res) => {
    const connection = await connect();
    try {
        
        const { email } = req.body;
        
        // Construir a consulta SQL com parâmetros de consulta
        const query = ` DELETE FROM TABLETK2 WHERE email = '${email}' AND code <> 1`;
        
        // Executar a consulta
        const result=await connection.execute(query);
        const query2 = `
        DELETE FROM TABLETK2
        WHERE email IN (
            SELECT email
            FROM (
                SELECT email
                FROM TABLETK2
                GROUP BY email
                HAVING COUNT(*) > 1
            ) AS duplicates
        )
    `;
        await connection.execute(query2)



        
        res.status(200).send('Cadastros atualizados com sucesso.');
    } catch (error) {
        // Em caso de erro, envie uma resposta com o erro
        console.error('Erro ao atualizar cadastros:', error.message);
        res.status(500).send('Ocorreu um erro ao atualizar cadastros.');
    } finally {
        // Fechar a conexão com o banco de dados
        await connection.end();
    }
});

app.post('/api/verificar_codigo', async (req, res) => {
    try {
        const connection = await connect();
        const { codigo } = req.body;
        const query_code = `SELECT COUNT(*) AS count FROM TABLETK2 WHERE code = ?`;
        const [rows, fields] = await connection.execute(query_code, [codigo]);
        const rowCount = rows[0].count;

        if (rowCount > 0) {
            const query_subs = 'UPDATE TABLETK2 SET code = \'1\' WHERE code = ?';
            await connection.execute(query_subs, [codigo]);
        } 

        res.json({ success: true, rowCount });
    } catch (error) {
        console.error('Erro ao verificar código:', error.message);
        res.status(500).json({ success: false, error: 'Ocorreu um erro ao verificar o código.' });
    }
});




app.post('/api/verificar_login', async (req, res) => {
    const connection = await connect();
    try {
        const { email, senha } = req.body;
        const query_code = `SELECT * FROM TABLETK2 WHERE email = ? AND senha = ?`;
        const [rows, fields] = await connection.execute(query_code, [email, senha]);
        
        const rowCount = rows.length;
        console.log(rowCount)
        
        if (rowCount > 0) {
            timestamp = Date.now();
            res.json({ success: true, timestamp });
        } else {
            // Login falhou
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Erro ao verificar o login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.post('/api/menos_download', async (req, res) => {
    const connection = await connect();
    try {
        const { email } = req.body;

        // Atualiza a coluna 'donwload' decrementando 1
        const queryUpdate = `UPDATE TABLETK2 SET donwload = donwload - 1 WHERE email = '${email}'`;
        await connection.execute(queryUpdate);
        
        const query_code = `SELECT donwload FROM TABLETK2 WHERE email = ?`;
        const [rows, fields] = await connection.execute(query_code, [email]);
        const novoDownload = rows[0] // novo valor da coluna 'donwload'
        res.json({ success: true, novoDownload });

    } catch (error) {
        console.error('Erro ao decrementar o donwload:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});


app.post('/api/get_downloads', async (req, res) => {
    
    const connection = await connect();
    try {
        const { email } = req.body;
        const query_code = `SELECT donwload FROM TABLETK2 WHERE email = ?`;
        const [rows, fields] = await connection.execute(query_code, [email]);
        const novoDownload = rows[0] // novo valor da coluna 'donwload'
        res.json({ success: true, novoDownload });

    } catch (error) {
        console.error('Erro ao decrementar o donwload:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
    
});



app.get('/clientes', async (req, res) => {
    const connection = await connect();
    try {
        // Conecte-se ao banco de dados
        
        // Execute a consulta SQL para obter todos os clientes
        const [rows, fields] = await connection.execute('SELECT * FROM TABLETK2');
        
        // Encerre a conexão
        await connection.end();
        
        // Envie os resultados da consulta como resposta HTTP
        res.json(rows);
    } catch (error) {
        res.status(500).send('Erro ao executar a consulta: ' + error.message);
    }
});

app.get('/clientes/criar', async (req, res) => {
    const connection = await connect();
    try {
        // Conecte-se ao banco de dados
        
        // Crie a tabela TABLETK2
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS TABLETK2 (
                cliente VARCHAR(255),
                cpf VARCHAR(11),
                email VARCHAR(255),
                code VARCHAR(255),
                download INT
            )
        `);

        // Insira um exemplo de cliente na tabela
        await connection.execute(`
            INSERT INTO TABLETK2 (cliente, cpf, email, code, donwload)
            VALUES ('Exemplo Cliente', '12345678901', 'exemplo@email.com', '123ABC', -5)
        `);

        // Encerre a conexão
        await connection.end();

        res.send('Tabela TABLETK2 criada e exemplo de cliente inserido com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao criar tabela TABLETK2 e inserir exemplo de cliente: ' + error.message);
    }
});


// Rota para a página inicial
app.get('/home', (req, res) => {
  res.send('Bem-vindo à página inicial!');
});

// Porta para o servidor escutar
const PORT = process.env.PORT || 9001;

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

