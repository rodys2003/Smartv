import React from 'react';

export function RequiredIndicator() {
  return (
    <>
      <span aria-hidden="true" className="text-red-600 dark:text-red-400">*</span>
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}
