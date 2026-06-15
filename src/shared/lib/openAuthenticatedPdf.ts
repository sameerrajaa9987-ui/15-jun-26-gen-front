import { http } from "@/shared/api/http";

/**
 * Fetches a PDF endpoint (which requires the Authorization header) as a blob
 * and opens it in a new tab. Returns the object URL so callers can revoke it.
 */
export async function openAuthenticatedPdf(path: string) {
  const res = await http.get(path, { responseType: "blob" });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  // Revoke after a delay so the new tab has time to load it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

/** Downloads a PDF endpoint as a file with the given name. */
export async function downloadAuthenticatedPdf(path: string, filename: string) {
  const res = await http.get(path, { responseType: "blob" });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
