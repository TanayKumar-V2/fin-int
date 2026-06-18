import { useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/appStore';

export function useUpload() {
  const { addDocument } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const doc = await api.uploadDocument(file);
      addDocument(doc);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
}
