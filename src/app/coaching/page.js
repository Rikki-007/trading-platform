import { redirect } from "next/navigation";

/**
 * Live expert-coaching rooms merged into /mentorship alongside 1:1
 * consultation booking — see src/app/mentorship/page.js. This redirect
 * exists so an old bookmark or link still lands somewhere real.
 */
export default function CoachingPage() {
  redirect("/mentorship");
}
