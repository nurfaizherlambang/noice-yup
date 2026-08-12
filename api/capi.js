// Vercel serverless function (Node runtime): forwards browser-tracked events
// to Meta's Conversions API, deduped against the Pixel via a shared event_id.
//
// Required env var (set in Vercel Project Settings -> Environment Variables):
//   META_CAPI_ACCESS_TOKEN   System User access token from Meta Events Manager
//                            -> this pixel -> Settings -> Conversions API.
// Optional:
//   META_PIXEL_ID            defaults to the pixel already wired into index.html.
//   META_CAPI_TEST_EVENT_CODE  from Events Manager -> Test Events, while verifying setup.
//
// If META_CAPI_ACCESS_TOKEN is not set, this responds 200 without contacting Meta
// so the browser Pixel keeps working standalone until CAPI is configured.

const DEFAULT_PIXEL_ID = '1020300154103051';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!accessToken) {
    res.status(200).json({ skipped: true, reason: 'META_CAPI_ACCESS_TOKEN not set' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (err) { body = {}; }
  }
  const { event_name, event_id, event_source_url, fbp, fbc, custom_data } = body || {};

  if (!event_name || !event_id) {
    res.status(400).json({ error: 'event_name and event_id are required' });
    return;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : req.socket && req.socket.remoteAddress) || undefined;

  const payload = {
    data: [
      {
        event_name: event_name,
        event_id: event_id,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: event_source_url,
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: req.headers['user-agent'],
          fbp: fbp || undefined,
          fbc: fbc || undefined
        },
        custom_data: custom_data || {}
      }
    ]
  };

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const metaRes = await fetch(
      'https://graph.facebook.com/v21.0/' + pixelId + '/events?access_token=' + encodeURIComponent(accessToken),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    const metaJson = await metaRes.json();
    res.status(metaRes.ok ? 200 : 502).json(metaJson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach Meta Conversions API' });
  }
};
