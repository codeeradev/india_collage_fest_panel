import { useState, useEffect } from 'react';

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

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  city?: any | null;
};

export function CityAddModal({ open, onClose, onSuccess, city }: Props) {
  const isEdit = Boolean(city);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    city: '',
    latitude: '',
    longitude: '',
    description: '',
    is_active: true,
    featured: false,
  });

  useEffect(() => {
    setForm(
      city
        ? {
            city: city.city || '',
            latitude: city.latitude || '',
            longitude: city.longitude || '',
            description: city.description || '',
            is_active: city.is_active ?? true,
            featured: city.featured ?? city.popular ?? false,
          }
        : {
            city: '',
            latitude: '',
            longitude: '',
            description: '',
            is_active: true,
            featured: false,
          }
    );
  }, [city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        city: form.city,
        latitude: form.latitude,
        longitude: form.longitude,
        description: form.description,
        is_active: form.is_active,
        featured: form.featured,
      };

      const res = isEdit
        ? await post(ENDPOINTS.EDIT_CITY(city._id), payload, { authRequired: true })
        : await post(ENDPOINTS.ADD_CITY, payload, { authRequired: true });

      onSuccess(res.data.message || 'City saved');
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
          maxHeight: '85vh',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" mb={2}>
          {isEdit ? 'Edit City' : 'New City'}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1.5} sx={{ overflowY: 'auto', pr: 1 }}>
          <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} />

          <TextField
            fullWidth
            label="Latitude"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Longitude"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
          />

          <Box display="flex" justifyContent="space-between">
            <FormControlLabel
              control={
                <Switch
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
              }
              label="Featured"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button onClick={onClose}>Cancel</Button>
            <LoadingButton loading={loading} variant="contained" onClick={handleSubmit}>
              {isEdit ? 'Update' : 'Save'}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
