'use client';

import { useState, useEffect } from 'react';
import api from '../api';
import { Model } from '../../types';

export function useModels(category?: string) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    api.get<Model[]>(`/api/models${params}`)
      .then((res) => setModels(res.data))
      .catch(() => setError('Failed to load models'))
      .finally(() => setLoading(false));
  }, [category]);

  return { models, loading, error };
}
