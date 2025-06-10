import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Download,
  Delete,
  Refresh,
  InsertDriveFile,
  Warning
} from '@mui/icons-material';
import AppBarComponent from '../components/AppBarComponent';

const Documentos = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
  const [actionLoading, setActionLoading] = useState(null);

  // Função para buscar arquivos do servidor
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/files');
      
      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar arquivos');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer download do arquivo
  const handleDownload = async (filename, originalName) => {
    try {
      setActionLoading(filename);
      
      const response = await fetch(`http://localhost:5000/api/download/${filename}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Erro ao fazer download do arquivo');
      }
    } catch (error) {
      setError('Erro de conexão ao fazer download');
    } finally {
      setActionLoading(null);
    }
  };

  // Função para deletar arquivo
  const handleDelete = async (filename) => {
    try {
      setActionLoading(filename);
      
      const response = await fetch(`http://localhost:5000/api/files/${filename}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFiles(files.filter(file => file.filename !== filename));
        setDeleteDialog({ open: false, file: null });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao deletar arquivo');
      }
    } catch (error) {
      setError('Erro de conexão ao deletar arquivo');
    } finally {
      setActionLoading(null);
    }
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  // Carregar arquivos ao montar o componente
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <>
      <AppBarComponent />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary">
              Documentos CSV
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchFiles}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Gerencie os arquivos CSV enviados para validação. Você pode baixar ou excluir os arquivos conforme necessário.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InsertDriveFile sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum arquivo encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Os arquivos CSV enviados aparecerão aqui
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nome do Arquivo</strong></TableCell>
                    <TableCell><strong>Tamanho</strong></TableCell>
                    <TableCell><strong>Data de Upload</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.filename} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InsertDriveFile color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {file.originalName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.filename}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatFileSize(file.size)} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(file.uploadDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleDownload(file.filename, file.originalName)}
                            disabled={actionLoading === file.filename}
                            title="Baixar arquivo"
                          >
                            {actionLoading === file.filename ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Download />
                            )}
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, file })}
                            disabled={actionLoading === file.filename}
                            title="Excluir arquivo"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {files.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total: {files.length} arquivo{files.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Dialog de confirmação para deletar */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, file: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o arquivo{' '}
              <strong>"{deleteDialog.file?.originalName}"</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, file: null })}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.file?.filename)}
              color="error"
              variant="contained"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : <Delete />}
            >
              {actionLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Documentos;