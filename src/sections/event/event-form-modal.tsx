import type { Event } from 'src/types/event';

import { useState, useEffect } from 'react';

import {
  Stack,
  Alert,
  Dialog,
  Button,
  Switch,
  MenuItem,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';

// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ----------------------------------------------------------------------

const EMPTY_FORM = {
  title: '',
  description: '',
  image: null as File | null,

  location: '',
  ticket_price: '',
  category: '',
  subCategory: '',
  address: '',

  eventMode: 'offline',
  visibility: true,

  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
};

// ----------------------------------------------------------------------

export default function EventFormModal({
  open,
  mode,
  event,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState<string | null>(null);

  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --------------------------------------------------
  // LOAD DROPDOWNS
  // --------------------------------------------------

  useEffect(() => {
    get(ENDPOINTS.GET_CITY).then((r) => setCities(r.data.data || []));
    get(ENDPOINTS.GET_CATEGORY).then((r) =>
      setCategories(r.data.category || [])
    );
  }, []);

  useEffect(() => {
    if (!form.category) return;

    get(ENDPOINTS.GET_SUBCATEGORY_BY_CATEGORY(form.category)).then(
      (r) => setSubCategories(r.data.subCategories || [])
    );
  }, [form.category]);

  // --------------------------------------------------
  // PREFILL EDIT
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setError('');
    setSuccess('');

    if (mode === 'edit' && event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        image: null,

        location:
          typeof event.location === 'string'
            ? event.location
            : event.location?._id || '',

        ticket_price: event.ticket_price || '',

        category:
          typeof event.category === 'string'
            ? event.category
            : event.category?._id || '',

        subCategory:
          typeof event.sub_category === 'string'
            ? event.sub_category
            : event.sub_category?._id || '',

        address: event.address || '',

        eventMode: event.eventMode || 'offline',
        visibility: event.visibility ?? true,

        start_date: event.start_date?.substring(0, 10) || '',
        end_date: event.end_date?.substring(0, 10) || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
      });

      setPreview(event.image || null);
    } else {
      setForm(EMPTY_FORM);
      setPreview(null);
    }
  }, [open, mode, event]);

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v as any);
      });

      if (mode === 'create') {
        await post(ENDPOINTS.ADD_EVENT, fd, {
          authRequired: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Event created successfully');
      } else {
        await post(ENDPOINTS.EDIT_EVENT(event!._id), fd, {
          authRequired: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Event updated successfully');
      }

      onSuccess();
      setTimeout(onClose, 700);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create Event' : 'Edit Event'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* IMAGE */}
          <Button component="label" variant="outlined">
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setForm({ ...form, image: file });
                setPreview(URL.createObjectURL(file));
              }}
            />
          </Button>

          {preview && (
            <img
              src={preview}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                borderRadius: 10,
              }}
            />
          )}

          {/* CITY */}
          <TextField
            select
            label="City"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          >
            {cities.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.city}
              </MenuItem>
            ))}
          </TextField>

          {/* CATEGORY */}
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
                subCategory: '',
              })
            }
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* SUB CATEGORY */}
          <TextField
            select
            label="Sub Category"
            value={form.subCategory}
            disabled={!subCategories.length}
            onChange={(e) =>
              setForm({ ...form, subCategory: e.target.value })
            }
          >
            {subCategories.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ticket Price"
            value={form.ticket_price}
            onChange={(e) =>
              setForm({ ...form, ticket_price: e.target.value })
            }
          />

          <TextField
            label="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.visibility}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visibility: e.target.checked,
                  })
                }
              />
            }
            label="Visible"
          />

          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
          />

          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={form.end_date}
            onChange={(e) =>
              setForm({ ...form, end_date: e.target.value })
            }
          />

          <TextField
            type="time"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            value={form.start_time}
            onChange={(e) =>
              setForm({ ...form, start_time: e.target.value })
            }
          />

          <TextField
            type="time"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            value={form.end_time}
            onChange={(e) =>
              setForm({ ...form, end_time: e.target.value })
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : null
          }
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
