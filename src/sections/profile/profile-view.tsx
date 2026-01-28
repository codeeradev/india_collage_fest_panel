import type {
  User,
  UserProfileForm,
  UserProfilePreview,
} from 'src/types/user';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

export default function ProfileView() {
  // -----------------------------------
  // STATE
  // -----------------------------------

  const [form, setForm] = useState<UserProfileForm>({
    name: '',
    phone: '',
    location: '',
    password: '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [preview, setPreview] = useState<UserProfilePreview>({
    image: null,
    banner: null,
  });

  const [loading, setLoading] = useState(false);

  // -----------------------------------
  // USER
  // -----------------------------------

  const user: User | null = (() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  })();

  // -----------------------------------
  // LOAD PROFILE
  // -----------------------------------

  useEffect(() => {
    if (!user?._id) return;

    get(ENDPOINTS.GET_PROFILE(user._id)).then((res) => {
      const u: User = res.data.profile;

      setForm({
        name: u.name ?? '',
        phone: String(u.phone ?? ''),
        location: u.location ?? '',
        password: '',
      });

      setPreview({
        image: u.image ?? null,
        banner: u.bannerImage ?? null,
      });
    });
  }, [user?._id]);

  // -----------------------------------
  // SUBMIT
  // -----------------------------------

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, String(v));
      });

      if (image) fd.append('image', image);
      if (banner) fd.append('bannerImage', banner);

      await post(ENDPOINTS.EDIT_PROFILE, fd, {
        authRequired: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Profile updated');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // HELPERS
  // -----------------------------------

  const img = (v?: string | null) =>
    !v ? undefined : v.startsWith('blob:') ? v : IMAGE_BASE_URL + v;

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <DashboardContent>
      <Typography variant="h4" mb={3}>
        Profile Settings
      </Typography>

      <Card
        sx={{
          p: 4,
          borderRadius: 5,
          background:
            'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        }}
      >
        <Grid container spacing={4}>
          {/* ================= LEFT ================= */}
          <Grid xs={12} md={4}>
            <Card
              sx={{
                p: 4,
                borderRadius: 5,
                textAlign: 'center',
                boxShadow: 3,
              }}
            >
              <Avatar
                src={img(preview.image)}
                sx={{
                  width: 140,
                  height: 140,
                  mx: 'auto',
                  mb: 2,
                  border: '5px solid white',
                }}
              />

              <Typography variant="h6">
                {form.name || 'Your Name'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
              >
                Profile picture
              </Typography>

              <Button
                component="label"
                fullWidth
                variant="outlined"
              >
                Change Avatar
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImage(f);
                    setPreview((p) => ({
                      ...p,
                      image: URL.createObjectURL(f),
                    }));
                  }}
                />
              </Button>

              <Divider sx={{ my: 4 }} />

              <Typography fontWeight={600}>
                Banner Image
              </Typography>

              {preview.banner && (
                <Box
                  component="img"
                  src={img(preview.banner)}
                  sx={{
                    width: '100%',
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: 3,
                    mt: 2,
                  }}
                />
              )}

              <Button
                component="label"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Upload Banner
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBanner(f);
                    setPreview((p) => ({
                      ...p,
                      banner: URL.createObjectURL(f),
                    }));
                  }}
                />
              </Button>
            </Card>
          </Grid>

          {/* ================= RIGHT ================= */}
          <Grid xs={12} md={8}>
            <Card
              sx={{
                p: 5,
                borderRadius: 5,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" mb={1}>
                Account Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={4}
              >
                Update your personal details
              </Typography>

              <Grid container spacing={3}>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={form.phone}
                    disabled
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City ID"
                    value={form.location}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        location: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    helperText="Leave empty to keep current password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid xs={12}>
                  <Button
                    size="large"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    onClick={handleSubmit}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} />
                      ) : null
                    }
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </DashboardContent>
  );
}
