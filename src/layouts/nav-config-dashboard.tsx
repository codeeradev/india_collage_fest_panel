import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

import { logout } from 'src/auth/auth';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: number[];   
  onClick?: () => void;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
    roles: [1, 3],
  },
  {
    title: 'Category',
    path: '/category',
    icon: icon('ic-category'),
    roles: [1],
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
    roles: [1],
  },
  {
    title: 'Approvals',
    path: '/approvals',
    icon: icon('ic-analytics'),
    roles: [1],
  },
  {
    title: 'Events',
    path: '/events',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
    roles: [1, 3],
  },
  {
    title: 'City',
    path: '/city',
    icon: icon('ic-blog'),
    roles: [1],
  },
  {
    title: 'Logout',
    path: '#',
    icon: icon('ic-lock'),
    onClick: () => logout(),
  },
];
