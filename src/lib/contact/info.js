/**
 * Placeholder contact/office details — single source of truth so Footer.jsx
 * and the Mentorship page's contact card never drift out of sync. Every
 * value here is a deliberate placeholder:
 *   - Phone numbers use the 555 exchange, which is reserved for fictional
 *     use and never assigned to a real subscriber.
 *   - Emails use the .example TLD, reserved by RFC 2606 for documentation
 *     and placeholder use — it will never resolve to a real inbox.
 *   - The office address is a generic, made-up placeholder, not a real
 *     location.
 * Swap these for the client's real details before launch — nothing else in
 * the codebase needs to change; every consumer imports from here.
 */
export const CONTACT_INFO = {
  supportPhone: "+1 (555) 019-4200",
  expertLinePhone: "+1 (555) 019-4288",
  supportEmail: "support@lodestarmeridian.example",
  communityEmail: "community@lodestarmeridian.example",
  office: {
    name: "Lodestar Meridian Exchange",
    line1: "1 Compass Way, Suite 400",
    line2: "Wilmington, DE 19801, USA",
  },
  hours: "Mon–Fri, 9:00–18:00 (confirm the client's real timezone before launch)",
};
