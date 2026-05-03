'use client';

import { useUserContext } from '../contexts/UserContext';

export function useUser() {
  const { user, loading, setUser, logout, refreshUser } = useUserContext();
  return { user, loading, setUser, logout, refreshUser };
}
