import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const calendar = google.calendar({
      version: 'v3',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Get busy times for the next 7 days
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }],
      },
    });

    const busyTimes = response.data.calendars?.primary?.busy || [];

    return NextResponse.json({ busy: busyTimes });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}
