import type { Event } from 'src/types/event';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import EventTable from '../event-table';
import EventToolbar from '../event-toolbar';
import EventFormModal from '../event-form-modal';
import GoogleFetchPreviewDialog from '../google-fetch-preview-dialog';

type AlertState = {
  message: string;
  severity: 'success' | 'error';
};

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [openGoogleFetch, setOpenGoogleFetch] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Event | null>(null);
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [category, setCategory] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const fetchEvents = async () => {
    const res = await get(ENDPOINTS.GET_EVENTS, {
      params: { page, limit: 10, search, cityId, category },
    });

    setEvents(res.data.events);
    setTotal(res.data.pagination.totalRecords);
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, cityId, category]);

  const escapeCsv = (value: unknown) => {
    if (value == null) return '';
    const text = String(value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const handleDownloadCsvSample = () => {
    const headers = [
      'title',
      'description',
      'address',
      'start_date',
      'end_date',
      'start_time',
      'end_time',
      'ticket_price',
      'city',
      'category',
      'sub_category',
      'event_mode',
      'visibility',
      'is_featured',
      'source',
      'image',
    ];

    const rows = events.map((event) => [
      event.title || '',
      event.description || '',
      event.address || '',
      event.start_date?.substring(0, 10) || '',
      event.end_date?.substring(0, 10) || '',
      event.start_time || '',
      event.end_time || '',
      event.ticket_price || '',
      event.location?.city || '',
      event.category?.name || '',
      event.sub_category?.name || '',
      event.eventMode || 'offline',
      event.visibility ?? true,
      event.isFeatured ?? false,
      'user',
      event.image || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `events_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const handleUploadCsv = async (file: File) => {
    if (!file) return;

    setCsvUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);

      const res = await post(ENDPOINTS.ADD_EVENT_CSV, formData, {
        authRequired: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = res.data?.data;
      const summary =
        result && typeof result === 'object'
          ? `Created: ${result.createdCount ?? 0}, Existing: ${result.skippedExisting ?? 0}, Invalid: ${result.skippedInvalid ?? 0}, Duplicates: ${result.skippedDuplicateInPayload ?? 0}`
          : '';

      setAlert({
        message: summary ? `${res.data?.message || 'CSV uploaded'}. ${summary}` : 'CSV uploaded',
        severity: 'success',
      });

      await fetchEvents();
    } catch (error: any) {
      setAlert({
        message: error?.response?.data?.message || 'Failed to upload event CSV',
        severity: 'error',
      });
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Events
        </Typography>

        <Button
          component="label"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
          disabled={csvUploading}
        >
          Upload CSV
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) handleUploadCsv(file);
            }}
          />
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={handleDownloadCsvSample}
        >
          Download CSV Sample
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={() => setOpenGoogleFetch(true)}
        >
          Fetch Google Events
        </Button>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setMode('create');
            setSelected(null);
            setOpen(true);
          }}
        >
          Create Event
        </Button>
      </Box>

      <EventToolbar
        search={search}
        city={cityId}
        category={category}
        onSearch={setSearch}
        onCity={setCityId}
        onCategory={setCategory}
      />
      <Box sx={{ mt: 3 }}>
        <EventTable
          rows={events}
          page={page}
          total={total}
          onPageChange={setPage}
          onReload={fetchEvents}
          onEdit={(event: Event) => {
            setMode('edit');
            setSelected(event);
            setOpen(true);
          }}
        />
      </Box>
      <EventFormModal
        open={open}
        mode={mode}
        event={selected}
        onClose={() => setOpen(false)}
        onSuccess={fetchEvents}
      />
      <GoogleFetchPreviewDialog
        open={openGoogleFetch}
        onClose={() => setOpenGoogleFetch(false)}
        onImported={fetchEvents}
      />
      <Snackbar open={!!alert} autoHideDuration={3500} onClose={() => setAlert(null)}>
        <Alert severity={alert?.severity || 'success'} onClose={() => setAlert(null)}>
          {alert?.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
