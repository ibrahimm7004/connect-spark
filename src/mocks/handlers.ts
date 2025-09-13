import { http, HttpResponse } from 'msw';

export const handlers = [
  // Backend API mocks
  http.post('/api/embedding', async () => {
    return HttpResponse.json({ success: true, embedding: Array.from({ length: 1536 }, () => 0.001) });
  }),

  http.post('/api/matches/compute', async () => {
    return HttpResponse.json({ matches: [{ match_user_id: 'user_b', similarity: 0.9 }] });
  }),

  http.post('/api/event/:eventId/qr', async ({ params }) => {
    return HttpResponse.json({ qr_url: `https://example.com/qr/${params.eventId}.png` });
  }),

  http.post('/api/recap/:eventId/:userId', async ({ params }) => {
    return HttpResponse.json({ recap_url: `https://example.com/recaps/${params.eventId}/${params.userId}.png` });
  }),
];


