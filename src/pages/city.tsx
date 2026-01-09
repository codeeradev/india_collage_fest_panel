import { CONFIG } from 'src/config-global';

import { CityView } from 'src/sections/city/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Cities - ${CONFIG.appName}`}</title>

      <CityView />
    </>
  );
}
