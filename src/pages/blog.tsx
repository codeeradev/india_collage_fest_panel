import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blogs - ${CONFIG.appName}`}</title>

      <BlogView />
    </>
  );
}
