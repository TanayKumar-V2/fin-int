import { useDropzone } from 'react-dropzone';
import { Upload, FilePlus } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function UploadZone() {
  const { uploadFile, isUploading } = useUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer text-center
        ${isDragActive ? 'border-cyan bg-cyan/5' : 'border-border bg-surface hover:border-cyan/50 hover:bg-surface2'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <LoadingSpinner size="md" />
      ) : (
        <>
          <FilePlus className="w-8 h-8 text-muted mb-2" />
          <p className="text-sm text-text font-medium">Drag & drop files here</p>
          <p className="text-xs text-muted mt-1">PDF, DOCX, PPTX, XLSX (max 50MB)</p>
        </>
      )}
    </div>
  );
}
