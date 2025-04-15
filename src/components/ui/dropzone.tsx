'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  fileName?: string;
  loading?: boolean;
}

export function Dropzone({
  onDrop,
  accept,
  maxSize = 5242880, // 5MB
  className,
  label = "Drag and drop or click to upload",
  sublabel,
  icon,
  fileName,
  loading = false,
}: DropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-all text-center cursor-pointer",
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-sm font-medium text-gray-600 mt-2">Uploading...</div>
          </div>
        ) : fileName ? (
          <div className="text-sm font-medium text-green-600">
            File selected: {fileName}
          </div>
        ) : (
          <>
            {icon || (
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            <div className="text-sm font-medium text-gray-800">{label}</div>
            {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
          </>
        )}
      </div>
    </div>
  );
} 