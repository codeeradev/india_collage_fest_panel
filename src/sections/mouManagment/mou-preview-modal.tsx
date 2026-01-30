import { useEffect } from 'react';
import { Icon } from '@iconify/react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
};

export default function MouPreviewModal({
  open,
  onClose,
  pdfUrl,
}: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        MOU Document

        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <Icon icon="mdi:close" width={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ height: '80vh', p: 0 }}>
        <iframe
          src={pdfUrl}
          title="MOU Preview"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
}
