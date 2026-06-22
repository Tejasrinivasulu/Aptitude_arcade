export const DEFAULT_ADMIN_EMAIL = 'admin@aptitudearcade.com';

export function isAdminAccount(user, tokenResult) {
  if (!user) return false;
  if (tokenResult?.claims?.admin === true) return true;
  return user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL;
}
