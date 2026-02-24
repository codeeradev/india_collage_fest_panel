import type { MOU } from 'src/types/mou';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import {
  extractClauses,
  stripClauseMarkers,
} from 'src/utils/mou-template';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

import MouTemplateRenderer from 'src/components/mou/mou-template-renderer';

// ----------------------------------------------------------------------

type LatestVersion = {
  htmlContent: string;
  remarks?: string;
  allClauses?: string[];
  acceptedClauses?: string[];
};

export function MouView() {
  const [mou, setMou] = useState<MOU | null>(null);
  const [latestVersion, setLatestVersion] = useState<LatestVersion | null>(null);

  const [htmlContent, setHtmlContent] = useState('');
  const [allClauses, setAllClauses] = useState<string[]>([]);
  const [acceptedClauses, setAcceptedClauses] = useState<boolean[]>([]);
  const [remarks, setRemarks] = useState('');

  const [success, setSuccess] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const loadBaseTemplate = async () => {
    const templateRes = await get(ENDPOINTS.ORGANISER_GET_BASE_TEMPLATE, { authRequired: true });
    const html = templateRes.data.data?.htmlContent;

    if (!html) return;

    const clauses = extractClauses(html);
    setHtmlContent(stripClauseMarkers(html));
    setAllClauses(clauses);
    setAcceptedClauses(clauses.map(() => true));
  };

  const loadCurrentMou = async () => {
    try {
      const mouRes = await get(ENDPOINTS.GET_MY_MOU, { authRequired: true });
      setMou(mouRes.data.data.mou);
      setLatestVersion(mouRes.data.data.latestVersion || null);
    } catch {
      setMou(null);
      setLatestVersion(null);
    }
  };

  useEffect(() => {
    Promise.all([loadBaseTemplate(), loadCurrentMou()]).finally(() => setLoading(false));
  }, []);

  const openLatestVersionPreview = () => {
    if (!latestVersion) return;

    setHtmlContent(latestVersion.htmlContent);
    setRemarks(latestVersion.remarks || '');
    setAllClauses(latestVersion.allClauses || []);
    setAcceptedClauses(
      (latestVersion.allClauses || []).map((clause) =>
        Boolean(latestVersion.acceptedClauses?.includes(clause))
      )
    );
    setPreviewOpen(true);
  };

  const toggleClause = (index: number) => {
    setAcceptedClauses((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  const submitToAdmin = async () => {
    setSubmitting(true);
    try {
      let currentMou = mou;

      if (!currentMou) {
        const started = await post(ENDPOINTS.START_MOU, {}, { authRequired: true });
        currentMou = started.data.data;
        setMou(currentMou);
      }

      const selectedClauses = allClauses.filter((_, index) => acceptedClauses[index]);

      await post(
        ENDPOINTS.ORGANISER_SUBMIT_MOU,
        {
          htmlContent,
          remarks,
          acceptedClauses: selectedClauses,
          allClauses,
        },
        { authRequired: true }
      );

      setSuccess('Sent to admin for review');
      setPreviewOpen(false);
      await loadCurrentMou();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Typography>Loading agreement...</Typography>
      </DashboardContent>
    );
  }

  const isEditable =
    !mou || mou.currentStatus === 'draft' || mou.currentStatus === 'sent_to_organiser';

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">MOU Agreement</Typography>
        {mou && <Chip label={mou.currentStatus || mou.status || 'draft'} />}
      </Box>

      <Button
        size="small"
        variant="outlined"
        sx={{ mb: 2 }}
        disabled={!latestVersion}
        onClick={openLatestVersionPreview}
      >
        View Latest Version
      </Button>

      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          p: 2,
          mb: 3,
          maxHeight: 400,
          overflowY: 'auto',
          backgroundColor: '#fafafa',
        }}
      >
        <MouTemplateRenderer content={htmlContent} />
      </Box>

      {allClauses.map((clause, index) => (
        <Box key={index} mb={1.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedClauses[index]}
                disabled={!isEditable}
                onChange={() => toggleClause(index)}
              />
            }
            label={<Typography variant="body2">{clause}</Typography>}
          />
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}

      {isEditable && (
        <>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Remarks (optional)"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            sx={{ mt: 2 }}
          />

          <Button sx={{ mt: 2 }} variant="contained" onClick={submitToAdmin} disabled={submitting}>
            Submit to Admin
          </Button>
        </>
      )}

      {mou?.currentStatus === 'sent_to_admin' && (
        <Alert sx={{ mt: 2 }} severity="info">
          Waiting for admin response
        </Alert>
      )}

      {mou?.currentStatus === 'final_agreed' && (
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          color="success"
          onClick={() => post(ENDPOINTS.SEND_MOU_OTP, {}, { authRequired: true })}
        >
          Sign Agreement
        </Button>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <Box p={2}>
          <Typography variant="h6" mb={2}>
            Latest MOU Version
          </Typography>

          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              mb: 2,
              maxHeight: 300,
              overflowY: 'auto',
              backgroundColor: '#fafafa',
            }}
          >
            <MouTemplateRenderer content={htmlContent} compact />
          </Box>

          {allClauses.map((clause, index) => (
            <FormControlLabel
              key={index}
              control={<Checkbox checked={acceptedClauses[index]} disabled />}
              label={clause}
            />
          ))}

          <Typography variant="subtitle1" mt={2}>
            Remarks
          </Typography>

          <Box sx={{ p: 1.5, mt: 1, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#fafafa' }}>
            {remarks || 'No remarks'}
          </Box>

          <Box textAlign="right" mt={2}>
            <Button variant="contained" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}
