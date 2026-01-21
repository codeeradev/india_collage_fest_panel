import type { Event } from 'src/types/event';

import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
};

export default function EventFormModal({
  open,
  mode,
  event,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // -----------------------------
  // FORM FILL / RESET
  // -----------------------------
  useEffect(() => {
    if (!open) return;

    setError('');
    setSuccess('');

    if (mode === 'edit' && event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start_date?.substring(0, 10) || '',
        end_date: event.end_date?.substring(0, 10) || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, event]);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      if (mode === 'create') {
        await post(ENDPOINTS.ADD_EVENT, form, {
          authRequired: true,
        });
        setSuccess('Event created successfully');
      } else {
        await post(ENDPOINTS.EDIT_EVENT(event!._id), form, {
          authRequired: true,
        });
        setSuccess('Event updated successfully');
      }

      onSuccess();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
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
            disabled={loading}
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            disabled={loading}
          />

          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
            disabled={loading}
          />

          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={form.end_date}
            onChange={(e) =>
              setForm({ ...form, end_date: e.target.value })
            }
            disabled={loading}
          />

          <TextField
            type="time"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            value={form.start_time}
            onChange={(e) =>
              setForm({ ...form, start_time: e.target.value })
            }
            disabled={loading}
          />

          <TextField
            type="time"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            value={form.end_time}
            onChange={(e) =>
              setForm({ ...form, end_time: e.target.value })
            }
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

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
          {mode === 'create'
            ? loading
              ? 'Creating...'
              : 'Create'
            : loading
            ? 'Updating...'
            : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
