/**
 * Server-side Daily.co REST helpers for creating consultation/live-trading
 * rooms. Never call these from the browser — DAILY_API_KEY is a secret.
 */

const BASE_URL = "https://api.daily.co/v1";

/**
 * Creates a Daily room. `properties.max_participants` distinguishes a 1:1
 * consultation (2) from a group live-trading room (higher, or omitted for
 * Daily's default).
 */
export async function createDailyRoom({ apiKey, name, properties = {} }) {
  const res = await fetch(`${BASE_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      privacy: "private",
      properties: {
        // Rooms expire 4 hours after creation by default — plenty for a
        // consultation, and avoids rooms lingering forever unused.
        exp: Math.round(Date.now() / 1000) + 60 * 60 * 4,
        enable_chat: true,
        ...properties,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daily.co room creation failed (${res.status}): ${body}`);
  }

  return res.json();
}

/**
 * Creates a short-lived meeting token scoping one user into one room, with
 * `is_owner` controlling host privileges (mute others, end the room, etc).
 * Use this instead of sharing the bare room URL so only invited
 * participants can join, and so the admin gets host controls.
 */
export async function createDailyMeetingToken({ apiKey, roomName, userName, isOwner }) {
  const res = await fetch(`${BASE_URL}/meeting-tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        is_owner: Boolean(isOwner),
        exp: Math.round(Date.now() / 1000) + 60 * 60 * 4,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daily.co token creation failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.token;
}
