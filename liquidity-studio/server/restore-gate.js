import { fail } from './auth.js';
/** Reserved destinations are unavailable until their complete installation activates. */
export function assertRestoreAvailable(state) {
  if (state?.editorRestore?.status === 'installing') throw fail(423, 'Editor restore is in progress; retry after activation or operator recovery');
}
