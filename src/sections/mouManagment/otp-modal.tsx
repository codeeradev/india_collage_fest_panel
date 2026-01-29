import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Stack,
} from "@mui/material";

import { useState } from "react";
import { post } from "src/api/apiClient";
import { ENDPOINTS } from "src/api/endpoint";

export default function OtpModal({
  open,
  onClose,
  reload,
}: {
  open: boolean;
  onClose: () => void;
  reload: () => void;
}) {
  const [otp, setOtp] = useState("");

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sign MOU</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={2}>
          <Button
            variant="outlined"
            onClick={() =>
              post(ENDPOINTS.SEND_MOU_OTP)
            }
          >
            Send OTP
          </Button>

          <TextField
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            variant="contained"
            onClick={async () => {
              await post(ENDPOINTS.VERIFY_MOU_OTP, {
                otp,
              });
              reload();
              onClose();
            }}
          >
            Verify & Sign
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
