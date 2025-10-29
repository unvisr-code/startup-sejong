import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import Image from 'next/image';
import { AnnouncementAttachment } from '../../lib/supabase';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: AnnouncementAttachment[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  onDownload: (attachment: AnnouncementAttachment) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onImageChange,
  onDownload
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentImage = images[currentIndex];

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onImageChange(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onImageChange(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, images.length, onClose, onImageChange]);

  // 이미지 URL 로드
  useEffect(() => {
    if (currentImage && isOpen) {
      setLoading(true);
      setError(false);
      setIsZoomed(false);
      
      import('../../lib/fileUpload').then(({ getImagePreviewUrl }) => {
        getImagePreviewUrl(currentImage.file_path).then((url) => {
          if (url) {
            setImageUrl(url);
          } else {
            setError(true);
          }
          setLoading(false);
        }).catch(() => {
          setError(true);
          setLoading(false);
        });
      });
    }
  }, [currentImage, isOpen]);

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 상단 컨트롤 */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-lg font-semibold truncate max-w-md">
              {currentImage.file_name}
            </h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              title={isZoomed ? "축소" : "확대"}
            >
              {isZoomed ? <FaCompress /> : <FaExpand />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(currentImage);
              }}
              className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              title="다운로드"
            >
              <FaDownload />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              title="닫기"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* 이미지 영역 */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className={`relative max-w-[90vw] max-h-[80vh] ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
        >
          {loading && (
            <div className="flex items-center justify-center w-96 h-64 bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center w-96 h-64 bg-gray-800 rounded-lg text-white">
              <div className="text-center">
                <p className="mb-2">이미지를 불러올 수 없습니다</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(currentImage);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다운로드
                </button>
              </div>
            </div>
          )}
          
          {imageUrl && !loading && !error && (
            <Image
              src={imageUrl}
              alt={`${currentImage.file_name} - 첨부 이미지 ${currentIndex + 1}/${images.length}`}
              width={isZoomed ? 1200 : 800}
              height={isZoomed ? 900 : 600}
              className={`object-contain rounded-lg transition-all duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={{
                maxWidth: isZoomed ? 'none' : '90vw',
                maxHeight: isZoomed ? 'none' : '80vh'
              }}
              onError={() => setError(true)}
              unoptimized={true}
              priority={currentIndex === 0}
            />
          )}
        </motion.div>

        {/* 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            {/* 이전 버튼 */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(currentIndex - 1);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                title="이전 이미지"
              >
                <FaChevronLeft size={20} />
              </button>
            )}

            {/* 다음 버튼 */}
            {currentIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(currentIndex + 1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                title="다음 이미지"
              >
                <FaChevronRight size={20} />
              </button>
            )}
          </>
        )}

        {/* 하단 썸네일 네비게이션 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2 p-2 bg-black bg-opacity-50 rounded-lg">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageChange(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;