import { CONFIG } from 'src/config-global';

import { MouView } from 'src/sections/mouAggrement/mou-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Mou - ${CONFIG.appName}`}</title>

      <MouView />
    </>
  );
}
