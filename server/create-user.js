// Script para cadastrar usuário no PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function criarUsuario({ username, password, nome_completo, perfil, telefone, empresa }) {
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, nome_completo, perfil, telefone, empresa) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [username, password, nome_completo, perfil, telefone, empresa]
    );
    console.log('Usuário criado com id:', result.rows[0].id);
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
  } finally {
    await pool.end();
  }
}

// Exemplo de uso:
criarUsuario({
  username: 'admin',
  password: 'senha123',
  nome_completo: 'Administrador do Sistema',
  perfil: 'admin',
  telefone: '(11) 99999-9999',
  empresa: 'Minha Empresa Ltda'
});
