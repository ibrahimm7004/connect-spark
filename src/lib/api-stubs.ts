import { supabase } from '@/integrations/supabase/client';

export const generateUserEmbedding = async (
  profile: { hobbies: string; about?: string }
): Promise<number[]> => {
  const res = await fetch('/api/embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      hobbies: profile.hobbies,
      about: profile.about,
    }),
  });
  if (!res.ok) throw new Error('Embedding API failed');
  const json = await res.json();
  return json.embedding as number[];
};

export const computeUserMatches = async (userId: string, eventId: string) => {
  const res = await fetch('/api/matches/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, event_id: eventId }),
  });
  if (!res.ok) throw new Error('Compute matches API failed');
  const json = await res.json();
  return { success: true, matchesGenerated: (json.matches || []).length };
};

export const triggerFullRecompute = async () => {
  // This endpoint recomputes matches for a given event; if you need all events, call per-event from admin UI
  // Here we just expose a helper that the Admin page calls indirectly
  return { success: true, eventsProcessed: 0, totalMatches: 0 };
};

export const generateEventQR = async (eventId: string): Promise<string> => {
  const res = await fetch(`/api/event/${encodeURIComponent(eventId)}/qr`, { method: 'POST' });
  if (!res.ok) throw new Error('QR generation API failed');
  const json = await res.json();
  return json.qr_url as string;
};

export const generateRecapInfographic = async (
  eventId: string,
  userId: string
): Promise<string> => {
  const res = await fetch(`/api/recap/${encodeURIComponent(eventId)}/${encodeURIComponent(userId)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Recap API failed');
  const json = await res.json();
  return json.recap_url as string;
};