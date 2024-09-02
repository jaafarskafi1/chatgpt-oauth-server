interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  // Add other relevant fields as needed
}

export async function getGoogleCalendarEvents(user_id: string, bearerToken: string) {
  const provider = "oauth_google"
  console.log('user_id', user_id)

  const response = await fetch(`https://api.clerk.com/v1/users/${user_id}/oauth_access_tokens/${provider}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  console.log('response', response)

  const googleAuthInfo = await response.json() as { data: { token: string }[] };
  console.log('googleAuthInfo', googleAuthInfo)
  const googleToken = googleAuthInfo.data[0]?.token
  console.log('googleToken', googleToken)
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams({
      timeMin: new Date().toISOString(),
      maxResults: '10',
      singleEvents: 'true',
      orderBy: 'startTime',
    }).toString()}`, {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    if (!response.ok) throw new Error('Failed to fetch Google Calendar events');
    const data = await response.json() as { items: GoogleCalendarEvent[] };
    return data.items;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    throw new Error('Failed to fetch Google Calendar events');
  }
}