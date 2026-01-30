import { useState, useEffect } from "react";

import { Box, Dialog, Button, TextField } from "@mui/material";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!open) {
    setOtp("");
  }
}, [open]);

  const verifyOtp = async () => {
    try {
      setLoading(true);

      await post(
        ENDPOINTS.VERIFY_MOU_OTP,
        { otp },
        { authRequired: true }
      );

      alert("MOU signed successfully");

      onClose();
      reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 4, width: 350 }}>
        <TextField
          fullWidth
          label="Enter 6 digit OTP"
          value={otp}
          inputProps={{ maxLength: 6 }}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button
          fullWidth
          sx={{ mt: 3 }}
          variant="contained"
          disabled={otp.length !== 6 || loading}
          onClick={verifyOtp}
        >
          Verify OTP
        </Button>
      </Box>
    </Dialog>
  );
}
