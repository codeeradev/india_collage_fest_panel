import type { MOU } from 'src/types/mou';

import { useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import {
  htmlToPlainText,
  plainTextToHtml,
  stripClauseMarkers,
  buildMouVariableMap,
} from 'src/utils/mou-template';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

import MouTemplateRenderer from 'src/components/mou/mou-template-renderer';

export default function MouAdminEditModal({
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
  const [html, setHtml] = useState(() =>
    stripClauseMarkers(htmlToPlainText(mou.htmlContent || ''))
  );
  const [remarks, setRemarks] = useState(mou.remarks || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
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
              onChange={(e) => setHtml(e.target.value)}
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
          onChange={(e) => setRemarks(e.target.value)}
        />

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" disabled={saving} onClick={save}>
            Send to Organiser
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
