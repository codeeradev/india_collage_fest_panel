import type { Event } from 'src/types/event';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import EventTable from '../event-table';
import EventToolbar from '../event-toolbar';
import EventFormModal from '../event-form-modal';

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Event | null>(null);
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [category, setCategory] = useState('');

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

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Events
        </Typography>

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
    </DashboardContent>
  );
}
