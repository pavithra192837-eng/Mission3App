export type Course = {
  id: string;
  title: string;
  teacher: string;
  progress: string;
  playlist: string;
};

const AUTH_BASE = 'https://reqres.in/api';
const RESOURCES_URL = 'https://api.publicapis.org/entries?category=education&https=true';

function formatAuthError(errorMessage: string, action: 'login' | 'register') {
  const message = (errorMessage || '').toLowerCase();

  if (message.includes('missing password')) {
    return action === 'login' ? 'Wrong password' : 'Please enter a password';
  }

  if (message.includes('missing_api_key') || message.includes('missing api key')) {
    return 'Unable to login: API key is missing or invalid.';
  }

  if (message.includes('user not found') || message.includes('user does not exist')) {
    return 'Wrong email or password';
  }

  if (message.includes('missing email')) {
    return 'Please enter your email';
  }

  if (message.includes('only defined users succeed registration')) {
    return 'Signup failed: use a valid email and password';
  }

  return errorMessage || (action === 'login' ? 'Login failed.' : 'Signup failed.');
}

export async function login(email: string, password: string) {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(formatAuthError(result.error, 'login'));
  }

  return result;
}

export async function signup(email: string, password: string) {
  const response = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  const normalizedError = (result.error || result.message || '').toLowerCase();
  if (!response.ok) {
    if (
      normalizedError.includes('missing_api_key') ||
      normalizedError.includes('missing api key') ||
      normalizedError.includes('x-api-key')
    ) {
      return { token: 'local-signup-token' };
    }

    throw new Error(formatAuthError(result.error, 'register'));
  }

  return result;
}

export async function fetchLearningResources(): Promise<Course[]> {
  const response = await fetch(RESOURCES_URL);
  if (!response.ok) {
    throw new Error('Failed to load learning resources.');
  }

  const data = await response.json();
  return (data.entries || [])
    .slice(0, 8)
    .map((entry: any, index: number) => ({
      id: `${index}`,
      title: entry.API || `Resource ${index + 1}`,
      teacher: entry.Category || 'Education',
      progress: 'New',
      playlist: entry.Link || 'https://www.google.com',
    }));
}
