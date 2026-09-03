import { redirect } from "next/navigation";

/**
 * 1:1 consultation booking merged into /mentorship alongside the live
 * coaching-room flow — see src/app/mentorship/page.js. This redirect
 * exists so an old bookmark or link still lands somewhere real.
 */
export default function MeetingPage() {
  redirect("/mentorship");
}
