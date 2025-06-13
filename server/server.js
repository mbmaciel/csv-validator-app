const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Rota para upload de arquivo
app.post('/api/upload', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    res.json({
      message: 'Arquivo enviado com sucesso',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadDate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

// Rota para listar arquivos
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(filesDir).map(filename => {
      const filePath = path.join(filesDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        originalName: filename.split('_').slice(1).join('_'), // Remove timestamp
        size: stats.size,
        uploadDate: stats.birthtime,
        downloadUrl: `/api/download/${filename}`
      };
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para download de arquivo
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(filesDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer download do arquivo' });
  }
});

// Rota para deletar arquivo
app.delete('/api/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(filesDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Arquivo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});