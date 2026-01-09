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
  });

  useEffect(() => {
    if (city) {
      setForm({
        city: city.city || '',
        latitude: city.latitude || '',
        longitude: city.longitude || '',
        description: city.description || '',
        is_active: city.is_active ?? true,
      });
    } else {
      setForm({
        city: '',
        latitude: '',
        longitude: '',
        description: '',
        is_active: true,
      });
    }
  }, [city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let res;

      if (isEdit) {
        res = await post(
          ENDPOINTS.EDIT_CITY(city._id),
          form,
          { authRequired: true }
        );
      } else {
        res = await post(
          ENDPOINTS.ADD_CITY,
          form,
          { authRequired: true }
        );
      }

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
          {isEdit ? 'Edit City' : 'New City'}
        </Typography>

        <TextField
          fullWidth
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Latitude"
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Longitude"
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          margin="normal"
        />

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
          control={
            <Switch
              checked={form.is_active}
              name="is_active"
              onChange={handleChange}
            />
          }
          label="Active"
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={handleSubmit}
          >
            {isEdit ? 'Update' : 'Save'}
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
}
