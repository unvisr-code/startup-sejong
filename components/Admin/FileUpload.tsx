import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaTimes, FaFile } from 'react-icons/fa';
import { 
  validateFileType, 
  validateFileSize, 
  formatFileSize, 
  getFileIcon,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE 
} from '../../lib/fileUpload';

interface FileItem {
  file: File;
  id: string;
}

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesChange, 
  maxFiles = 5,
  disabled = false 
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileItem[] = [];
    const newErrors: string[] = [];

    fileArray.forEach((file) => {
      // 파일 개수 제한 확인
      if (files.length + validFiles.length >= maxFiles) {
        newErrors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      // 중복 파일 확인
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
        newErrors.push(`${file.name}: 이미 추가된 파일입니다.`);
        return;
      }

      // 파일 타입 검증
      if (!validateFileType(file)) {
        newErrors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
        return;
      }

      // 파일 크기 검증
      if (!validateFileSize(file)) {
        newErrors.push(`${file.name}: 파일 크기가 ${formatFileSize(MAX_FILE_SIZE)}를 초과합니다.`);
        return;
      }

      validFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`
      });
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles.map(f => f.file));
    }

    setErrors(newErrors);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!disabled && e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    onFilesChange([]);
    setErrors([]);
  };

  return (
    <div className="space-y-4">
      {/* 파일 업로드 영역 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          파일을 여기에 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-sm text-gray-500 mb-4">
          최대 {maxFiles}개 파일, 각 파일 최대 {formatFileSize(MAX_FILE_SIZE)}
        </p>
        <p className="text-xs text-gray-400">
          지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, ZIP, RAR, 7Z
        </p>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">업로드 오류:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">
              선택된 파일 ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={clearAllFiles}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
              type="button"
              disabled={disabled}
            >
              <FaTimes size={12} />
              모두 삭제
            </button>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {getFileIcon(fileItem.file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  type="button"
                  disabled={disabled}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;