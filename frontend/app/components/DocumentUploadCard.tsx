'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import styles from './DocumentUploadCard.module.css';

interface DocumentUploadCardProps {
  onUpload: (file: File) => void;
}

export default function DocumentUploadCard({ onUpload }: DocumentUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitFile = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      clearFile();
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div 
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${selectedFile ? styles.hasFile : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        
        {!selectedFile ? (
          <div className={styles.uploadPrompt}>
            <div className={styles.iconContainer}>
              <UploadCloud size={24} className={styles.uploadIcon} />
            </div>
            <p className={styles.promptText}>Click or drag to upload document</p>
            <span className={styles.subText}>Supports PDF, JPG, PNG</span>
          </div>
        ) : (
          <div className={styles.filePreview}>
            <div className={styles.fileInfo}>
              <File size={20} className={styles.fileIcon} />
              <span className={styles.fileName}>{selectedFile.name}</span>
            </div>
            <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); clearFile(); }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {selectedFile && (
        <button className={styles.uploadBtn} onClick={submitFile}>
          Upload Document
        </button>
      )}
    </div>
  );
}
