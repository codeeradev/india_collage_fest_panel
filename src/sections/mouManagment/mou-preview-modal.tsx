import { Dialog } from '@mui/material';

export default function MouPreviewModal({
  open,
  pdf,
  onClose,
}: any) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <iframe
        src={pdf}
        style={{ width: '100%', height: '80vh' }}
      />
    </Dialog>
  );
}
