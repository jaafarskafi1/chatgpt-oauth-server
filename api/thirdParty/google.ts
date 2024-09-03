import { GoogleEmail } from './types';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  // Add other relevant fields as needed
}

export async function getGoogleCalendarEvents(userId: string) {
  const provider = "oauth_google"

  const response = await fetch(`https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/${provider}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });

  const googleAuthInfo = await response.json() as { token: string }[];
  const googleToken = googleAuthInfo[0].token

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

// Function to get Gmail messages
export async function getGmailMessages(userId: string, maxResults: number = 10): Promise<GoogleEmail[]> {
  const provider = "oauth_google"

  const response = await fetch(`https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/${provider}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });

  const googleAuthInfo = await response.json() as { token: string }[];
  const googleToken = googleAuthInfo[0].token

  try {
    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    if (!response.ok) {
      console.error('Failed to fetch Gmail messages:', await response.text());
      throw new Error('Failed to fetch Gmail messages');
    }

    const data = await response.json() as { messages: { id: string }[] };

    // Fetch full message details for each message
    const messages = await Promise.all(
      data.messages.map(async (message) => {
        const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: { Authorization: `Bearer ${googleToken}` },
        });
        if (!messageResponse.ok) {
          console.error(`Failed to fetch message ${message.id}:`, await messageResponse.text());
          throw new Error(`Failed to fetch message ${message.id}`);
        }
        return messageResponse.json() as Promise<GoogleEmail>;
      })
    );

    return messages;
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    throw new Error('Failed to fetch Gmail messages');
  }
}

// Function to send a Gmail message
export async function sendGmailMessage(userId: string, to: string, subject: string, body: string): Promise<void> {
  const provider = "oauth_google"

  const response = await fetch(`https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/${provider}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });

  const googleAuthInfo = await response.json() as { token: string }[];
  const googleToken = googleAuthInfo[0].token

  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (!response.ok) {
      console.error('Failed to send Gmail message:', await response.text());
      throw new Error('Failed to send Gmail message');
    }
  } catch (error) {
    console.error("Error sending Gmail message:", error);
    throw new Error('Failed to send Gmail message');
  }
}