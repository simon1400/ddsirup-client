import { NextRequest, NextResponse } from 'next/server';
import {
  sendFbEvents,
  hashForFb,
  buildUserDataFromRequest,
  type FbEvent,
  type FbUserData,
  type FbCustomData,
} from '@/lib/facebook-capi';

/**
 * Client → Server CAPI proxy.
 * Client sends event details, server hashes PII and forwards to Facebook CAPI.
 * This ensures the access token never leaves the server.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_name,
      event_id,
      event_source_url,
      custom_data,
      // Optional PII for enhanced matching
      email,
      phone,
      first_name,
      last_name,
      city,
      zip,
      country,
    } = body as {
      event_name: string;
      event_id: string;
      event_source_url?: string;
      custom_data?: FbCustomData;
      email?: string;
      phone?: string;
      first_name?: string;
      last_name?: string;
      city?: string;
      zip?: string;
      country?: string;
    };

    if (!event_name || !event_id) {
      return NextResponse.json({ error: 'Missing event_name or event_id' }, { status: 400 });
    }

    // Build user_data from request (IP, UA, cookies)
    const userData: FbUserData = buildUserDataFromRequest(req);

    // Hash PII if provided
    if (email) userData.em = await hashForFb(email);
    if (phone) userData.ph = await hashForFb(phone.replace(/\s/g, ''));
    if (first_name) userData.fn = await hashForFb(first_name);
    if (last_name) userData.ln = await hashForFb(last_name);
    if (city) userData.ct = await hashForFb(city);
    if (zip) userData.zp = await hashForFb(zip.replace(/\s/g, ''));
    if (country) userData.country = await hashForFb(country);

    const event: FbEvent = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: userData,
      custom_data,
    };

    // Fire and forget — don't block the client
    sendFbEvents([event]).catch((err) =>
      console.error('[fb-events] Failed to send:', err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[fb-events] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
