import { useState } from 'react';

interface ApplicantIdentity {
  id: string;
  user_metadata?: Record<string, unknown>;
}

export function useApplicantName(user: ApplicantIdentity | null) {
  const [draft, setDraft] = useState<{ userId: string; value: string } | null>(null);
  const suggestedName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
  // An empty draft is intentional, not a signal to restore the Google name.
  const name = user && draft?.userId === user.id ? draft.value : suggestedName;
  const setName = (value: string) => {
    if (user) setDraft({ userId: user.id, value });
  };
  return [name, setName] as const;
}
