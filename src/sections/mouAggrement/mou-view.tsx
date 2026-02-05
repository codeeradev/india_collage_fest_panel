import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

export function MouView() {
  const [mou, setMou] = useState<any>(null);
  const [html, setHtml] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMou = async () => {
    try {
      const res = await get(ENDPOINTS.GET_MY_MOU, { authRequired: true });
      setMou(res.data.data);
    } catch {
      setMou(null);
    }
  };

  useEffect(() => {
    loadMou();
  }, []);

  const startMou = async () => {
    await post(ENDPOINTS.START_MOU, {}, { authRequired: true });
    loadMou();
  };

  const submitToAdmin = async () => {
    setLoading(true);
    try {
      await post(
        ENDPOINTS.ORGANISER_SUBMIT_MOU,
        { htmlContent: html },
        { authRequired: true }
      );
      setAlert('Sent to admin for review');
      loadMou();
    } finally {
      setLoading(false);
    }
  };

  if (!mou) {
    return (
      <DashboardContent>
        <Typography variant="h4">My Agreement</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={startMou}>
          Start Agreement
        </Button>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Typography variant="h4">My Agreement</Typography>
        <Chip label={mou.currentStatus} color="info" />
      </Box>

      {/* EDITABLE ONLY WHEN ORGANISER TURN */}
      {(mou.currentStatus === 'draft' ||
        mou.currentStatus === 'sent_to_organiser') && (
        <>
          <TextField
            fullWidth
            multiline
            minRows={10}
            label="Legal Terms"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            loading={loading}
            onClick={submitToAdmin}
          >
            Send to Admin
          </Button>
        </>
      )}

      {/* WAITING STATE */}
      {mou.currentStatus === 'sent_to_admin' && (
        <Alert severity="info">
          Waiting for admin review...
        </Alert>
      )}

      {/* FINAL SIGN STEP */}
      {mou.currentStatus === 'final_agreed' && (
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            post(ENDPOINTS.SEND_MOU_OTP, {}, { authRequired: true })
          }
        >
          Sign Agreement (Send OTP)
        </Button>
      )}

      {/* SIGNED */}
      {mou.currentStatus === 'signed' && (
        <Alert severity="success">
          Agreement signed successfully.  
          <br />
          <a href={mou.finalPdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
        </Alert>
      )}

      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        onClose={() => setAlert(null)}
      >
        <Alert severity="success">{alert}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}
