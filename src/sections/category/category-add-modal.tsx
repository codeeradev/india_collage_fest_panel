import { useState } from 'react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function CategoryAddModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
    isFeatured: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (icon) fd.append('image', icon);

      const res = await post(ENDPOINTS.ADD_CATEGORY, fd, {
        authRequired: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess(res.data.message || 'Category added');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 420,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Typography variant="h6" mb={2}>
          New Category
        </Typography>

        <TextField
          fullWidth
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          margin="normal"
        />

        <Button component="label" variant="outlined" sx={{ my: 2 }}>
          {icon ? icon.name : 'Upload icon'}
          <input hidden type="file" accept="image/*" onChange={(e) => setIcon(e.target.files?.[0] || null)} />
        </Button>

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
          margin="normal"
        />

        <FormControlLabel
          control={<Switch checked={form.isActive} name="isActive" onChange={handleChange} />}
          label="Active"
        />

        <FormControlLabel
          control={<Switch checked={form.isFeatured} name="isFeatured" onChange={handleChange} />}
          label="Featured"
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleSubmit}>
            Save
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
}
