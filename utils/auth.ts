import NodeCache from 'node-cache';
import { NextFunction, Request as ExpressRequest, Response } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    user_id: string;
    access_token: string; // Add this line
  };
}

interface ClerkUser {
  user_id: string;
  // Add other properties returned by Clerk API if needed
}

const tokenCache = new NodeCache({ stdTTL: 3600 });

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const bearerToken = authHeader.split(' ')[1];
  const cachedUser = tokenCache.get<ClerkUser>(bearerToken);
  if (cachedUser && cachedUser.user_id) {
    req.user = { user_id: cachedUser.user_id, access_token: bearerToken };
    next();
    return;
  }

  try {
    const clerkUser = await fetchClerkUser(bearerToken);
    tokenCache.set(bearerToken, clerkUser);
    req.user = { user_id: clerkUser.user_id, access_token: bearerToken };
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

async function fetchClerkUser(bearerToken: string): Promise<ClerkUser> {
  const clerkBaseUrl = process.env.CLERK_BASE_URL;
  if (!clerkBaseUrl) {
    throw new Error('CLERK_BASE_URL is not defined in environment variables');
  }

  const response = await fetch(`${clerkBaseUrl}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!response.ok) {
    console.error(response);
    throw new Error(`Authentication failed with status: ${response.status}`);
  }

  const userData = await response.json() as ClerkUser;
  if (!userData.user_id) {
    throw new Error('Failed getting Clerk user data');
  }

  return userData;
}