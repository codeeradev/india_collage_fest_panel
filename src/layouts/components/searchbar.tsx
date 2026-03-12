import type { BoxProps } from '@mui/material/Box';
import type { NavItem } from 'src/layouts/nav-config-dashboard';

import { type FormEvent, useMemo, useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { Iconify } from 'src/components/iconify';

import { getToken, getTokenPayload } from 'src/auth/auth';

import { useRouter } from 'src/routes/hooks';

import { navData } from '../nav-config-dashboard';

// ----------------------------------------------------------------------

type SearchableNavItem = Pick<NavItem, 'title' | 'path'> & {
  normalizedTitle: string;
  normalizedPath: string;
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export function Searchbar({ sx, ...other }: BoxProps) {
  const theme = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchableNavItems = useMemo<SearchableNavItem[]>(() => {
    const token = getToken();
    const payload = token ? getTokenPayload(token) : null;
    const roleId = payload?.roleId;

    return navData
      .filter((item) => {
        const hasRoute = Boolean(item.path && item.path !== '#' && !item.onClick);
        const hasRoleAccess =
          !item.roles || (typeof roleId === 'number' && item.roles.includes(roleId));

        return hasRoute && hasRoleAccess;
      })
      .map((item) => ({
        title: item.title,
        path: item.path,
        normalizedTitle: normalizeText(item.title),
        normalizedPath: normalizeText(item.path),
      }));
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, []);

  const findMatchingPath = useCallback(
    (query: string) => {
      const normalizedQuery = normalizeText(query);
      if (!normalizedQuery) return null;

      const exactMatch = searchableNavItems.find(
        (item) =>
          item.normalizedTitle === normalizedQuery || item.normalizedPath === normalizedQuery
      );

      if (exactMatch) return exactMatch.path;

      const partialMatch = searchableNavItems.find(
        (item) =>
          item.normalizedTitle.includes(normalizedQuery) ||
          normalizedQuery.includes(item.normalizedTitle) ||
          item.normalizedPath.includes(normalizedQuery)
      );

      return partialMatch?.path ?? null;
    },
    [searchableNavItems]
  );

  const handleSearch = useCallback(() => {
    const query = searchQuery.trim();
    if (!query) return;

    const matchedPath = findMatchingPath(query);
    if (matchedPath) {
      router.push(matchedPath);
      handleClose();
      return;
    }

    if (query.startsWith('/')) {
      router.push(query);
      handleClose();
    }
  }, [findMatchingPath, handleClose, router, searchQuery]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              top: 0,
              left: 0,
              zIndex: 99,
              width: '100%',
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              px: { xs: 3, md: 5 },
              boxShadow: theme.vars.customShadows.z8,
              height: {
                xs: 'var(--layout-header-mobile-height)',
                md: 'var(--layout-header-desktop-height)',
              },
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              backgroundColor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
              ...sx,
            }}
            component="form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              handleSearch();
            }}
            {...other}
          >
            <Input
              autoFocus
              fullWidth
              disableUnderline
              value={searchQuery}
              placeholder="Search menu (e.g. profile)"
              onChange={(event) => setSearchQuery(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              }
              sx={{ fontWeight: 'fontWeightBold' }}
            />
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Box>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
