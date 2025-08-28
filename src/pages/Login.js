import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, styled, keyframes } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const smokeAnimation = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1.2);
    opacity: 1;
    text-shadow: 0 0 5px rgba(0,0,0,0.2);
  }
  100% {
    transform: translate(20px, -120px) rotate(15deg) scale(2);
    opacity: 0;
  }
`;

const SmokeTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Impact, Charcoal, "Arial Black", sans-serif',
  fontSize: '6rem',
  color: '#2c3e50',
  textAlign: 'center',
  textTransform: 'uppercase',
  '& span': {
    display: 'inline-block',
    animation: `${smokeAnimation} 3s infinite linear`,
    '&:nth-of-type(1)': { animationDelay: '0s' },
    '&:nth-of-type(2)': { animationDelay: '0.3s' },
    '&:nth-of-type(3)': { animationDelay: '0.6s' },
    '&:nth-of-type(4)': { animationDelay: '0.9s' },
    '&:nth-of-type(5)': { animationDelay: '1.2s' },
    '&:nth-of-type(6)': { animationDelay: '1.5s' },
    '&:nth-of-type(7)': { animationDelay: '1.8s' },
  }
}));

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f5',
      overflow: 'hidden'
    }}>
      <SmokeTitle component="h1" sx={{ mb: 0 }}>
        {'Delator'.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </SmokeTitle>
      <Paper sx={{ p: 4, width: 350, zIndex: 1 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuário"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            label="Senha"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
