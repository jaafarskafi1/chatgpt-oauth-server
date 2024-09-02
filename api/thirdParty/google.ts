interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  // Add other relevant fields as needed
}

export async function getGoogleCalendarEvents(user_id: string, bearerToken: string) {
  const clerkBaseUrl = process.env.CLERK_BASE_URL;
  if (!clerkBaseUrl) {
    throw new Error('CLERK_BASE_URL is not defined in environment variables');
  }

  const provider = "oauth_google"

  const response = await fetch(`${clerkBaseUrl}/oauth/users/${user_id}/oauth_access_tokens/${provider}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  const googleAuthInfo = await response.json() as { data: { token: string }[] };

  const googleToken = googleAuthInfo.data[0]?.token
  try {
    // const token = await getGoogleTokenForUser(userId);
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams({
      timeMin: new Date().toISOString(),
      maxResults: '10',
      singleEvents: 'true',
      orderBy: 'startTime',
    }).toString()}`, {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    console.log('response', response)
    console.log('googleToken', googleToken)

    if (!response.ok) throw new Error('Failed to fetch Google Calendar events');
    const responseText = await response.text(); // Get the raw response text
    console.log('Raw response:', responseText); // Log the raw response
    let data;
    try {
      data = JSON.parse(responseText) as { items: GoogleCalendarEvent[] };
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Problematic JSON string:', responseText);
      throw new Error('Invalid JSON response from Google Calendar API');
    }
    console.log('data', data)
    return data.items;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    throw new Error('Failed to fetch Google Calendar events');
  }
}