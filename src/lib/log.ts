/** Server-side diagnostics. Visible in `next dev` / hosting logs, not the UI. */
export function logFallback(scope: string, reason?: unknown) {
  if (reason === undefined) {
    console.error(`[playlikekids] ${scope}`);
    return;
  }
  console.error(`[playlikekids] ${scope}`, reason);
}
