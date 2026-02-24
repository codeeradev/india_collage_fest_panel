import { CONFIG } from 'src/config-global';

import {SocialView}  from 'src/sections/social/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Social - ${CONFIG.appName}`}</title>
      <SocialView />
    </>
  );
}
