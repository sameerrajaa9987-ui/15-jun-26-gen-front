/**
 * Share helpers. Per the SOW (§2.2), WhatsApp share opens WhatsApp with a
 * pre-filled message; the user then attaches the downloaded PDF and taps send.
 * Email uses a mailto: fallback (server-side transactional email is a
 * deployment-time configuration item).
 */

export function shareViaWhatsApp(mobile: string | undefined, message: string) {
  const phone = (mobile || "").replace(/\D/g, "");
  // Default to India country code when a 10-digit number is given.
  const withCc = phone.length === 10 ? `91${phone}` : phone;
  const base = withCc ? `https://wa.me/${withCc}` : "https://wa.me/";
  const url = `${base}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function shareViaEmail(email: string | undefined, subject: string, body: string) {
  const to = email || "";
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}
