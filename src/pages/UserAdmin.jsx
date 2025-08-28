import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PrivateRoute from '../components/PrivateRoute.jsx';
import AppBarComponent from '../components/AppBarComponent';
import { Container, Paper, Typography, Box, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const UserAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
  username: '',
  password: '',
  perfil: 'user',
  nome_completo: '',
  telefone: '',
  empresa: ''
});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/users', {
      headers: {
        'x-user': JSON.stringify(user)
      }
    })
      .then(res => res.json())
      .then(setUsers);
  }, [user]);

  if (!user || user.perfil !== 'admin') {
    return (
      <>
        <AppBarComponent />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" color="error" align="center">Acesso restrito. Apenas administradores.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
  e.preventDefault();
  if (editingId) {
    fetch(`http://localhost:5000/api/users/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user': JSON.stringify(user) },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(updated => {
        setUsers(users.map(u => (u.id === editingId ? updated : u)));
        setEditingId(null);
        setForm({
          username: '',
          password: '',
          perfil: 'user',
          nome_completo: '',
          telefone: '',
          empresa: ''
        });
      });
  } else {
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': JSON.stringify(user) },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(newUser => {
        setUsers([...users, newUser]);
        setForm({
          username: '',
          password: '',
          perfil: 'user',
          nome_completo: '',
          telefone: '',
          empresa: ''
        });
      });
  }
};

  const handleEdit = user => {
  setEditingId(user.id);
  setForm({
    username: user.username,
    password: '',
    perfil: user.perfil === 'admin' ? 'admin' : 'user',
    nome_completo: user.nome_completo || '',
    telefone: user.telefone || '',
    empresa: user.empresa || ''
  });
};

  const handleDelete = id => {
    if (window.confirm('Tem certeza que deseja apagar este usuário?')) {
      fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': JSON.stringify(user) }
      })
        .then(() => setUsers(users.filter(u => u.id !== id)));
    }
  };

  return (
    <>
      <AppBarComponent />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
          <Typography variant="h4" gutterBottom color="primary">Administração de Usuários</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <TextField name="username" label="Usuário" value={form.username} onChange={handleChange} required sx={{ flex: 1 }} />
          <TextField name="password" label="Senha" type="password" value={form.password} onChange={handleChange} required={!editingId} sx={{ flex: 1 }} />
          <TextField name="nome_completo" label="Nome Completo" value={form.nome_completo} onChange={handleChange} required sx={{ flex: 2 }} />
          <TextField name="telefone" label="Telefone" value={form.telefone} onChange={handleChange} sx={{ flex: 1 }} />
          <TextField name="empresa" label="Empresa" value={form.empresa} onChange={handleChange} sx={{ flex: 2 }} />
          <Select name="perfil" value={form.perfil} onChange={handleChange} sx={{ minWidth: 120 }}>
            <MenuItem value="user">Usuário</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
          <Button type="submit" variant="contained" color="primary">{editingId ? 'Salvar' : 'Adicionar'}</Button>
          {editingId && <Button type="button" variant="outlined" color="secondary" onClick={() => { setEditingId(null); setForm({ username: '', password: '', perfil: 'user', nome_completo: '', telefone: '', empresa: '' }); }}>Cancelar</Button>}
        </Box>
          <Table>
            <TableHead>
               <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Nome Completo</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.nome_completo}</TableCell>
                  <TableCell>{u.telefone}</TableCell>
                  <TableCell>{u.empresa}</TableCell>
                  <TableCell>{u.perfil === 'admin' ? 'admin' : 'user'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleEdit(u)}>Editar</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(u.id)}>Apagar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>
  );
};

export default props => (
  <PrivateRoute>
    <UserAdmin {...props} />
  </PrivateRoute>
);
