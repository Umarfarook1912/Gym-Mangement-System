import { useState } from 'react';

export function useModal(initial = false) {
  const [open, setOpen] = useState(initial);
  const [payload, setPayload] = useState(null);

  function openModal(nextPayload = null) {
    setPayload(nextPayload);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setPayload(null);
  }

  return { open, payload, openModal, closeModal };
}
