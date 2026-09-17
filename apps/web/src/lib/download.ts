/**
 * Hands a Blob to the browser as a file download. Needed because the API
 * is bearer-token only: a plain link can't carry the token, so files are
 * fetched through the api client and saved from memory here.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked on the next tick so the click has started the download first.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Saves text the app produced itself (the import template). */
export function saveText(text: string, filename: string, type = "text/csv;charset=utf-8"): void {
  saveBlob(new Blob([text], { type }), filename);
}

/** YYYY-MM-DD in the viewer's own timezone, for filenames and date inputs. */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
