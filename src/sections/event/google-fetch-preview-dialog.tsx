import { useState } from 'react';

import {
  Box,
  Chip,
  Link,
  Alert,
  Stack,
  Table,
  Paper,
  Button,
  Dialog,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TextField,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

type DatePreset =
  | ''
  | 'today'
  | 'tomorrow'
  | 'thisWeek'
  | 'thisWeekend'
  | 'nextWeek'
  | 'nextMonth'
  | 'thisMonth'
  | 'next6months';

type PreviewEvent = {
  source: 'google';
  googleEventId: string;
  title: string;
  description: string;
  image: string;
  address: string;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  htmlLink: string;
  timezone: string;
  when: string;
};

type PreviewMeta = {
  query: string;
  datePreset: string | null;
  timeZone: string;
  count: number;
  totalScraped: number;
  strategy: string;
  queryUsed: string;
  fallbackUsed: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
};

const PRESET_OPTIONS: Array<{ label: string; value: DatePreset }> = [
  { label: 'Any Date', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Weekend', value: 'thisWeekend' },
  { label: 'Next Week', value: 'nextWeek' },
  { label: 'Next Month', value: 'nextMonth' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Next 6 Months', value: 'next6months' },
];

const QUERY_SUGGESTIONS = [
  'events delhi this week',
  'events mumbai this weekend',
  'events bangalore tomorrow',
  'events kolkata',
];

const getImportSummaryText = (summary: any) =>
  `Created: ${summary?.createdCount ?? 0}, Existing: ${summary?.skippedExisting ?? 0}, Invalid: ${summary?.skippedInvalid ?? 0}, Duplicates: ${summary?.skippedDuplicateInPayload ?? 0}`;

export default function GoogleFetchPreviewDialog({ open, onClose, onImported }: Props) {
  const [query, setQuery] = useState('events india');
  const [datePreset, setDatePreset] = useState<DatePreset>('');

  const [loading, setLoading] = useState(false);
  const [importingAll, setImportingAll] = useState(false);
  const [importingSingleId, setImportingSingleId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState<PreviewEvent[]>([]);
  const [meta, setMeta] = useState<PreviewMeta | null>(null);

  const handleFetch = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        query: query.trim(),
        datePreset: datePreset || undefined,
      };

      const res = await post(ENDPOINTS.FETCH_GOOGLE_EVENTS_PREVIEW, payload, {
        authRequired: true,
        timeout: 180000
      });

      setEvents(res.data?.events || []);
      setMeta(res.data?.meta || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch Google events');
      setEvents([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (importEvents: PreviewEvent[], singleEventId?: string) => {
    if (!importEvents.length) return;

    try {
      setError('');
      setSuccess('');

      if (singleEventId) {
        setImportingSingleId(singleEventId);
      } else {
        setImportingAll(true);
      }

      const res = await post(
        ENDPOINTS.IMPORT_GOOGLE_EVENTS,
        { events: importEvents },
        {
          authRequired: true,
          timeout: 180000,
        }
      );

      const summaryText = getImportSummaryText(res.data?.data);
      setSuccess(`${res.data?.message || 'Events imported successfully'}. ${summaryText}`);
      onImported?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to import events');
    } finally {
      setImportingAll(false);
      setImportingSingleId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Fetch Google Events (Scraper)</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Alert severity="info">
            Fetch events, then use Import buttons to create them in database.
          </Alert>
          <Alert severity="warning">
            Google scraper date presets can be inconsistent. If result is empty, try query text like{' '}
            <strong>events delhi this week</strong> and keep preset as <strong>Any Date</strong>.
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search Query"
              placeholder="events delhi this week"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <TextField
              select
              label="Date Preset"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              sx={{ minWidth: 170 }}
            >
              {PRESET_OPTIONS.map((item) => (
                <MenuItem key={item.value || 'any'} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {QUERY_SUGGESTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                clickable
                onClick={() => setQuery(item)}
                variant="outlined"
              />
            ))}
          </Stack>

          <Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleFetch} disabled={loading || !query.trim()}>
                {loading ? (
                  <>
                    <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                    Fetching...
                  </>
                ) : (
                  'Fetch Events'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleImport(events)}
                disabled={loading || importingAll || Boolean(importingSingleId) || !events.length}
              >
                {importingAll ? (
                  <>
                    <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                    Importing All...
                  </>
                ) : (
                  'Import All'
                )}
              </Button>
            </Stack>
          </Box>

          {meta && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Query: ${meta.query}`} />
              <Chip label={`Used Query: ${meta.queryUsed}`} />
              <Chip label={`Count: ${meta.count}`} color="primary" />
              <Chip label={`Total Scraped: ${meta.totalScraped}`} />
              <Chip label={`Strategy: ${meta.strategy}`} />
              {meta.fallbackUsed && <Chip label="Fallback Applied" color="warning" />}
              <Chip label={`TZ: ${meta.timeZone}`} />
            </Box>
          )}

          {events.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>When</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Import</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.googleEventId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {event.title}
                        </Typography>
                        {event.htmlLink && (
                          <Typography
                            variant="caption"
                            component="a"
                            target="_blank"
                            rel="noreferrer"
                            href={event.htmlLink}
                            sx={{ display: 'inline-block', mt: 0.5 }}
                          >
                            Open Link
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{`${event.start_date || '-'} ${event.start_time || ''}`}</TableCell>
                      <TableCell>{`${event.end_date || '-'} ${event.end_time || ''}`}</TableCell>
                      <TableCell>{event.address || '-'}</TableCell>
                      <TableCell>{event.when || '-'}</TableCell>
                      <TableCell>{event.source}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={Boolean(importingSingleId) || importingAll || loading}
                          onClick={() => handleImport([event], event.googleEventId)}
                        >
                          {importingSingleId === event.googleEventId ? (
                            <>
                              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                              Importing...
                            </>
                          ) : (
                            'Import'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && meta && events.length === 0 && (
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                No events found for the selected query.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try removing Date Preset and use query format like: events city this week.
              </Typography>
              <Link
                component="button"
                underline="hover"
                variant="caption"
                onClick={() => {
                  setDatePreset('');
                  if (!/\bevents?\b/i.test(query)) {
                    setQuery(`events ${query}`.trim());
                  }
                }}
              >
                Quick fix: set Any Date and normalize query
              </Link>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
