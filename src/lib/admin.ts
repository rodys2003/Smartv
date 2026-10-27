export const ADMIN_EMAILS: string[] = [
  'developer01012003@gmail.com',
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : []),
];

/**
 * Checks if the given email has administrative privileges.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail);
}
