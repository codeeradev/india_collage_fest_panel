import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await post(ENDPOINTS.LOGIN_PANEL, {
        email,
        password,
      });

      // save token
      localStorage.setItem('accessToken', res.data.token);

      // save user
      localStorage.setItem('user', JSON.stringify(res.data.user));

      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------

  return (
    <>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Panel Login</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Login with your registered email and password
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* EMAIL */}
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* PASSWORD */}
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  <Iconify
                    icon={
                      showPassword
                        ? 'solar:eye-bold'
                        : 'solar:eye-closed-bold'
                    }
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* LOGIN BUTTON */}
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="contained"
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>
    </>
  );
}
