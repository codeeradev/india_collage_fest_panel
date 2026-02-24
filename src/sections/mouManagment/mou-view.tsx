import type { MOU } from 'src/types/mou';

import DataTable from 'react-data-table-component';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import {
  extractClauses,
  htmlToPlainText,
  plainTextToHtml,
  stripClauseMarkers,
  buildMouVariableMap,
  MOU_TEMPLATE_VARIABLES,
} from 'src/utils/mou-template';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';

import { Iconify } from 'src/components/iconify';
import MouTemplateRenderer from 'src/components/mou/mou-template-renderer';

const getStatusColor = (status?: string) => {
  if (status === 'signed') return 'success';
  if (status === 'final_agreed') return 'info';
  if (status === 'sent_to_admin') return 'warning';
  return 'default';
};

function MouTable({
  rows,
  loading,
  onPreview,
  onFinalize,
  onEdit,
}: {
  rows: MOU[];
  loading: boolean;
  onPreview: (row: MOU) => void;
  onFinalize: (row: MOU) => void;
  onEdit: (row: MOU) => void;
}) {
  const columns = [
    {
      name: 'MOU No',
      selector: (row: MOU) => row.mouNumber,
      sortable: true,
    },
    {
      name: 'Organisation',
      selector: (row: MOU) => row.organization?.name || '',
      grow: 2,
    },
    {
      name: 'Status',
      cell: (row: MOU) => (
        <Chip
          size="small"
          label={row.currentStatus || row.status || 'draft'}
          color={getStatusColor(row.currentStatus || row.status) as any}
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row: MOU) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Review">
            <IconButton onClick={() => onPreview(row)}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onEdit(row)}
            disabled={(row.currentStatus || row.status) !== 'sent_to_admin'}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => onFinalize(row)}
            disabled={(row.currentStatus || row.status) !== 'sent_to_admin'}
          >
            Finalize
          </Button>

          {row.signedPdfUrl && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              component="a"
              href={row.signedPdfUrl}
              target="_blank"
            >
              PDF
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <DataTable
        columns={columns as any}
        data={rows}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
        noDataComponent="No MOUs found"
      />
    </Box>
  );
}

function MouReviewDialog({
  open,
  mou,
  onClose,
}: {
  open: boolean;
  mou: MOU;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Latest MOU Review</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <MouTemplateRenderer
            content={mou.htmlContent || ''}
            variables={buildMouVariableMap(mou)}
            showPlaceholders
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Organiser Decisions</Typography>

        <Stack spacing={1} mt={1}>
          {(mou.allClauses || []).map((clause) => {
            const accepted = mou.acceptedClauses?.includes(clause);

            return (
              <Box
                key={clause}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: accepted ? '#e8f5e9' : '#fdecea',
                  border: `1px solid ${accepted ? '#4caf50' : '#f44336'}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={accepted ? 'Accepted' : 'Rejected'}
                    color={accepted ? 'success' : 'error'}
                  />

                  <Typography variant="body2">{clause}</Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Remarks</Typography>

        <Box
          sx={{
            mt: 1,
            p: 1.5,
            border: '1px solid #ddd',
            borderRadius: 1,
            bgcolor: '#fafafa',
          }}
        >
          {mou.remarks || 'No remarks provided'}
        </Box>
      </DialogContent>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

function MouEditDialog({
  open,
  mou,
  onClose,
  onSaved,
}: {
  open: boolean;
  mou: MOU;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [html, setHtml] = useState(() => stripClauseMarkers(htmlToPlainText(mou.htmlContent || '')));
  const [remarks, setRemarks] = useState(mou.remarks || '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);

    await post(
      ENDPOINTS.ADMIN_REPLY_MOU,
      {
        mouId: mou._id,
        htmlContent: plainTextToHtml(stripClauseMarkers(html)),
        remarks,
      },
      { authRequired: true }
    );

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit & Send Back to Organiser</DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2">MOU Content (Plain Text)</Typography>

            <TextField
              fullWidth
              multiline
              minRows={10}
              sx={{ mt: 1 }}
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              placeholder="Paste plain text here. Use # for headings and - for bullet lists. Put Terms & Conditions as a bullet list under its heading."
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Use {'{{variable}}'} for dynamic values if supported by your template.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Preview</Typography>

            <Box
              sx={{
                mt: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                maxHeight: 320,
                overflowY: 'auto',
                bgcolor: '#fafafa',
              }}
            >
              <MouTemplateRenderer
                content={html}
                variables={buildMouVariableMap(mou)}
                showPlaceholders
                compact
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Remarks</Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          sx={{ mt: 1 }}
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
        />

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" disabled={saving} onClick={onSave}>
            Send to Organiser
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function MOUView() {
  const [rows, setRows] = useState<MOU[]>([]);
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [previewRow, setPreviewRow] = useState<MOU | null>(null);
  const [editRow, setEditRow] = useState<MOU | null>(null);

  const textareaRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);

    const [mouRes, templateRes] = await Promise.all([
      get(ENDPOINTS.ADMIN_GET_MOUS, { authRequired: true }),
      get(ENDPOINTS.ADMIN_GET_BASE_TEMPLATE, { authRequired: true }),
    ]);

    setRows(mouRes.data.data || []);
    setTemplate(stripClauseMarkers(htmlToPlainText(templateRes.data.data?.htmlContent || '')));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveTemplate = async () => {
    try {
      setSavingTemplate(true);
      await post(
        ENDPOINTS.ADMIN_UPSERT_BASE_TEMPLATE,
        { htmlContent: plainTextToHtml(stripClauseMarkers(template)) },
        { authRequired: true }
      );
      setSuccess('Template saved successfully');
    } catch {
      setError('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const clauses = useMemo(() => extractClauses(template), [template]);
  const sampleVariables = useMemo(() => buildMouVariableMap(rows[0]), [rows]);

  const insertVariable = (key: string) => {
    const token = `{{${key}}}`;

    if (!textareaRef.current) {
      setTemplate((prev) => `${prev}${token}`);
      return;
    }

    const input = textareaRef.current;
    const start = input.selectionStart ?? template.length;
    const end = input.selectionEnd ?? template.length;
    const next = `${template.slice(0, start)}${token}${template.slice(end)}`;

    setTemplate(next);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const finalize = async (mou: MOU) => {
    if (!mou.latestVersionId) return;

    if (!window.confirm(`Finalize MOU ${mou.mouNumber}?`)) return;

    await post(
      ENDPOINTS.FINALIZE_MOU,
      { mouId: mou._id, versionId: mou.latestVersionId },
      { authRequired: true }
    );

    load();
  };

  return (
    <Box>
      <Typography variant="h4">Master MOU Template</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Template (Plain Text)</Typography>

        <TextField
          fullWidth
          multiline
          minRows={16}
          sx={{ mt: 1 }}
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          inputRef={textareaRef}
          placeholder="Paste plain text here. Use # for headings and - for bullet lists. Put Terms & Conditions as a bullet list under its heading."
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Use {'{{variable}}'} for dynamic values if supported by your template.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Dynamic Values
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {MOU_TEMPLATE_VARIABLES.map((item) => (
            <Chip
              key={item.key}
              label={`${item.label} ({{${item.key}}})`}
              size="small"
              onClick={() => insertVariable(item.key)}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mt: 3 }}>
          Preview
        </Typography>

        <Box
          sx={{
            mt: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            maxHeight: 520,
            overflowY: 'auto',
            bgcolor: '#fafafa',
          }}
        >
          <MouTemplateRenderer
            content={stripClauseMarkers(template)}
            variables={sampleVariables}
            showPlaceholders
            compact
          />
        </Box>

        {clauses.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Optional clauses ({clauses.length}) will appear as checkboxes for organisers.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {clauses.map((clause, index) => (
                <Chip key={`${clause}-${index}`} label={clause} size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <Button sx={{ mt: 2 }} variant="contained" disabled={savingTemplate} onClick={saveTemplate}>
        Save Template
      </Button>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h4">Organiser MOUs</Typography>

      <MouTable
        rows={rows}
        loading={loading}
        onPreview={setPreviewRow}
        onFinalize={finalize}
        onEdit={setEditRow}
      />

      {previewRow && (
        <MouReviewDialog open={!!previewRow} mou={previewRow} onClose={() => setPreviewRow(null)} />
      )}

      {editRow && (
        <MouEditDialog
          open={!!editRow}
          mou={editRow}
          onClose={() => setEditRow(null)}
          onSaved={load}
        />
      )}

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
