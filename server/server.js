const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://usuario:senha@localhost:5432/csvvalidator',
});

// Criar pasta files se não existir
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filesDir);
  },
  filename: (req, file, cb) => {
    // Adicionar timestamp para evitar conflitos de nome
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos!'), false);
    }
  }
});

// Middleware para extrair usuário do header
function getUserFromHeader(req, res, next) {
  try {
    const user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token de usuário inválido' });
  }
}

// Rota para upload de arquivo
app.post('/api/upload', upload.single('csvFile'), async (req, res) => {
  const { userId } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'Identificação do usuário é necessária' });
  }
  try {
    const { filename: filepath, originalname: filename } = req.file;
    const result = await pool.query(
      'INSERT INTO uploads (user_id, filename, filepath) VALUES ($1, $2, $3) RETURNING *',
      [userId, filename, filepath]
    );
    res.json({ message: 'Arquivo enviado com sucesso', upload: result.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar upload no banco de dados:', error);
    // Em caso de erro no BD, remove o arquivo que foi salvo no disco
    fs.unlink(req.file.path, (err) => {
        if (err) console.error("Erro ao deletar arquivo após falha no DB:", err);
    });
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

// Rota para listar arquivos
app.get('/api/files', getUserFromHeader, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, filepath, uploaded_at FROM uploads WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.id]
    );
    const files = result.rows.map(file => {
        const filePath = path.join(filesDir, file.filepath);
        const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { size: 0 };
        return {
            id: file.id,
            filename: file.filepath, // O nome salvo no disco
            originalName: file.filename, // O nome original do arquivo
            size: stats.size,
            uploadDate: file.uploaded_at,
            downloadUrl: `/api/download/${file.filepath}`
        };
    });
    res.json(files);
  } catch (error) {
    console.error("Erro ao listar arquivos do usuário:", error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para download de arquivo
app.get('/api/download/:filename', getUserFromHeader, async (req, res) => {
  try {
    const { filename } = req.params;
    const { id: userId, perfil } = req.user;

    const result = await pool.query(
      'SELECT user_id, filename FROM uploads WHERE filepath = $1',
      [filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const upload = result.rows[0];
    if (upload.user_id !== userId && perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const filePath = path.join(filesDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.download(filePath, upload.filename); // Envia com o nome original
  } catch (error) {
    console.error("Erro ao fazer download do arquivo:", error);
    res.status(500).json({ error: 'Erro ao fazer download do arquivo' });
  }
});

// Rota para deletar arquivo
app.delete('/api/files/:filename', getUserFromHeader, async (req, res) => {
  try {
    const { filename } = req.params;
    const { id: userId, perfil } = req.user;

    const findResult = await pool.query(
      'SELECT user_id FROM uploads WHERE filepath = $1',
      [filename]
    );

    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const upload = findResult.rows[0];
    if (upload.user_id !== userId && perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await pool.query('DELETE FROM uploads WHERE filepath = $1', [filename]);

    const filePath = path.join(filesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ message: 'Arquivo deletado com sucesso' });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

  // Rota de login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query(
        'SELECT id, username, nome_completo, perfil, telefone, empresa FROM usuarios WHERE username = $1 AND password = $2',
        [username, password]
      );
      if (result.rows.length === 1) {
        // Usuário autenticado
        return res.json({
          success: true,
          user: result.rows[0]
        });
      } else {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao autenticar', error: error.message });
    }
  });

  // Middleware simples para checar perfil admin
  function requireAdmin(req, res, next) {
    const user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
    if (!user || user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  }

  // Listar usuários
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, username, perfil, nome_completo, telefone, empresa FROM usuarios ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  });

  // Criar usuário
  app.post('/api/users', requireAdmin, async (req, res) => {
    const { username, password, perfil, nome_completo, telefone, empresa } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO usuarios (username, password, perfil, nome_completo, telefone, empresa) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, perfil, nome_completo, telefone, empresa',
        [username, password, perfil, nome_completo, telefone, empresa]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  // Editar usuário
  app.put('/api/users/:id', requireAdmin, async (req, res) => {
    const { username, password, perfil, nome_completo, telefone, empresa } = req.body;
    const { id } = req.params;
    try {
      let query, params;
      if (password) {
        query = 'UPDATE usuarios SET username = $1, password = $2, perfil = $3, nome_completo = $4, telefone = $5, empresa = $6 WHERE id = $7 RETURNING id, username, perfil, nome_completo, telefone, empresa';
        params = [username, password, perfil, nome_completo, telefone, empresa, id];
      } else {
        query = 'UPDATE usuarios SET username = $1, perfil = $2, nome_completo = $3, telefone = $4, empresa = $5 WHERE id = $6 RETURNING id, username, perfil, nome_completo, telefone, empresa';
        params = [username, perfil, nome_completo, telefone, empresa, id];
      }
      const result = await pool.query(query, params);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao editar usuário' });
    }
  });

  // Apagar usuário
  app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao apagar usuário' });
    }
  });

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});