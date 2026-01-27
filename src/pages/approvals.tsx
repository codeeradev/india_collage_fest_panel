import { CONFIG } from 'src/config-global';

import { ApprovalsView } from 'src/sections/approvals/approvals-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Events - ${CONFIG.appName}`}</title>

      <ApprovalsView />
    </>
  );
}
