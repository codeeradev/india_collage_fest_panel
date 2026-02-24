import { CONFIG } from 'src/config-global';

import  PermissonView from "src/sections/permissons/permisson-view";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Permisson - ${CONFIG.appName}`}</title>

      <PermissonView />
    </>
  );
}
