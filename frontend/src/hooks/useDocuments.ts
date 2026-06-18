import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/appStore';

export function useDocuments() {
  const { documents, setDocuments, removeDocument, updateDocument } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll for document status if indexing
  useEffect(() => {
    const indexingDocs = documents.filter(d => d.status === 'indexing');
    if (indexingDocs.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of indexingDocs) {
        try {
          const statusObj = await api.getDocumentStatus(doc.id);
          if (statusObj.status !== 'indexing') {
            updateDocument(doc.id, statusObj);
          }
        } catch (e) {
          console.error('Failed to poll status', e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documents, updateDocument]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await api.deleteDocument(id);
      removeDocument(id);
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  return { documents, isLoading, deleteDocument, fetchDocuments };
}
