import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";

import { Iconify } from "src/components/iconify";

export default function MouPdfPreview({
  open,
  onClose,
  pdfUrl,
}: {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        MOU Document
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ height: "80vh" }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </DialogContent>
    </Dialog>
  );
}
