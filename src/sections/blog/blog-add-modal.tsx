import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  blog?: any | null;
};

export function BlogAddModal({ open, onClose, onSuccess, blog }: Props) {
  const isEdit = Boolean(blog);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isPublished: true,
  });

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        author: blog.author || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        metaKeywords: blog.metaKeywords || '',
        isPublished: blog.isPublished ?? true,
      });
    } else {
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: '',
        tags: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        isPublished: true,
      });
    }
  }, [blog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
      if (image) fd.append('image', image);

      const res = isEdit
        ? await post(ENDPOINTS.ADMIN_EDIT_BLOG(blog._id), fd, {
            authRequired: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await post(ENDPOINTS.ADMIN_ADD_BLOG, fd, {
            authRequired: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      onSuccess(res.data.message || 'Blog saved');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 520,
          maxHeight: '90vh',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" mb={2}>
          {isEdit ? 'Edit Blog' : 'New Blog'}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1.5} sx={{ overflowY: 'auto', pr: 1 }}>
          <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} />
          <TextField fullWidth label="Slug (optional)" name="slug" value={form.slug} onChange={handleChange} />
          <TextField fullWidth label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} multiline rows={2} />
          <TextField fullWidth label="Content" name="content" value={form.content} onChange={handleChange} multiline rows={6} />
          <TextField fullWidth label="Author" name="author" value={form.author} onChange={handleChange} />
          <TextField fullWidth label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} />
          <TextField fullWidth label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
          <TextField fullWidth label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} multiline rows={2} />
          <TextField fullWidth label="Meta Keywords" name="metaKeywords" value={form.metaKeywords} onChange={handleChange} />

          <Button component="label" variant="outlined">
            {image ? image.name : 'Upload cover image'}
            <input hidden type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </Button>

          <FormControlLabel
            control={<Switch checked={form.isPublished} name="isPublished" onChange={handleChange} />}
            label="Publish"
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button onClick={onClose}>Cancel</Button>
            <LoadingButton loading={loading} variant="contained" onClick={handleSubmit}>
              {isEdit ? 'Update' : 'Save'}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
