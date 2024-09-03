export type OAuthProvider =
  'oauth_google' |
  'oauth_microsoft' |
  'oauth_github' |
  'oauth_dropbox' |
  'oauth_facebook' |
  'oauth_apple' |
  'oauth_twitter' |
  'oauth_linkedin' |
  'oauth_discord' |
  'oauth_twitch' |
  'oauth_tiktok' |
  'oauth_gitlab' |
  'oauth_slack' |
  'oauth_spotify' |
  'oauth_notion';

export interface GoogleEmail {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body: { data: string };
  };
  internalDate: string;
}

export interface GoogleAuthInfo { token: string }[]
