import { supabase } from './supabase';

// Storage 설정 확인
export const checkStorageSetup = async (): Promise<{ hasStorage: boolean; hasBucket: boolean; error?: string }> => {
  try {
    // Supabase client가 mock인지 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { hasStorage: false, hasBucket: false, error: 'Supabase 환경변수가 설정되지 않았습니다.' };
    }

    // Storage 연결 테스트
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Storage list error:', listError);
      return { hasStorage: false, hasBucket: false, error: `Storage 접근 실패: ${listError.message}` };
    }

    // announcement-attachments 버킷 존재 확인
    const hasBucket = buckets?.some(bucket => bucket.name === 'announcement-attachments') || false;
    
    return { 
      hasStorage: true, 
      hasBucket, 
      error: hasBucket ? undefined : 'announcement-attachments 버킷이 존재하지 않습니다.' 
    };
  } catch (error) {
    console.error('Storage setup check error:', error);
    return { hasStorage: false, hasBucket: false, error: 'Storage 설정 확인 중 오류가 발생했습니다.' };
  }
};

// 허용된 파일 타입
export const ALLOWED_FILE_TYPES = {
  // 문서
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  
  // 이미지
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  
  // 압축파일
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z'
};

// 최대 파일 크기 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 파일 타입 검증
export const validateFileType = (file: File): boolean => {
  return Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
};

// 파일 크기 검증
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

// 파일 이름 안전화 (특수문자 제거)
export const sanitizeFileName = (fileName: string): string => {
  // 파일명과 확장자 분리
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  
  // 한글, 영문, 숫자, 하이픈, 언더스코어만 허용 (공백과 특수문자 제거)
  const sanitizedName = name
    .replace(/[^\w가-힣-]/g, '_') // 특수문자를 언더스코어로 변경
    .replace(/_{2,}/g, '_') // 연속된 언더스코어를 하나로
    .replace(/^_+|_+$/g, ''); // 시작과 끝의 언더스코어 제거
  
  // 확장자도 정리
  const sanitizedExtension = extension.replace(/[^\w.-]/g, '').toLowerCase();
  
  return sanitizedName + sanitizedExtension;
};

// 파일 크기를 읽기 쉬운 형태로 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일 아이콘 가져오기
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType === 'text/plain') return '📋';
  return '📎';
};

// 단일 파일 업로드
export const uploadFile = async (
  file: File, 
  announcementId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Storage 설정 확인
    const storageCheck = await checkStorageSetup();
    if (!storageCheck.hasStorage || !storageCheck.hasBucket) {
      console.error('Storage setup issue:', storageCheck.error);
      return { 
        success: false, 
        error: `Storage 설정 오류: ${storageCheck.error}\n\n설정 가이드:\n1. Supabase 대시보드 > Storage 이동\n2. 'announcement-attachments' 버킷 생성\n3. 버킷을 Public으로 설정` 
      };
    }

    // 파일 검증
    if (!validateFileType(file)) {
      return { success: false, error: `지원하지 않는 파일 형식입니다. (${file.type})` };
    }
    
    if (!validateFileSize(file)) {
      return { success: false, error: `파일 크기가 ${formatFileSize(MAX_FILE_SIZE)}를 초과합니다. (현재: ${formatFileSize(file.size)})` };
    }
    
    // 파일 이름 생성 (중복 방지)
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `announcements/${announcementId}/${fileName}`;
    
    console.log('Uploading file:', { originalName: file.name, sanitizedName, filePath, size: file.size, type: file.type });
    
    // Supabase Storage에 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from('announcement-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { 
        success: false, 
        error: `파일 업로드에 실패했습니다.\n오류 상세: ${uploadError.message}\n파일: ${file.name}`
      };
    }
    
    // DB에 파일 정보 저장
    const { data: dbData, error: dbError } = await supabase
      .from('announcement_attachments')
      .insert({
        announcement_id: announcementId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Storage에서 업로드된 파일 삭제 (rollback)
      await supabase.storage
        .from('announcement-attachments')
        .remove([filePath]);
        
      return { success: false, error: '파일 정보 저장에 실패했습니다.' };
    }
    
    return { success: true, data: dbData };
    
  } catch (error) {
    console.error('File upload error:', error);
    return { success: false, error: `파일 업로드 중 오류가 발생했습니다.\n오류 내용: ${error instanceof Error ? error.message : '알 수 없는 오류'}` };
  }
};

// Fallback: Storage 없이 파일 정보만 DB에 저장 (개발/테스트용)
export const uploadFileMetadataOnly = async (
  file: File, 
  announcementId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.warn('Fallback mode: Saving file metadata only (no actual file storage)');
    
    // 파일 검증
    if (!validateFileType(file)) {
      return { success: false, error: `지원하지 않는 파일 형식입니다. (${file.type})` };
    }
    
    if (!validateFileSize(file)) {
      return { success: false, error: `파일 크기가 ${formatFileSize(MAX_FILE_SIZE)}를 초과합니다. (현재: ${formatFileSize(file.size)})` };
    }
    
    // 가상 파일 경로 생성
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `fallback/announcements/${announcementId}/${fileName}`;
    
    // DB에 파일 정보 저장 (실제 파일은 저장하지 않음)
    const { data: dbData, error: dbError } = await supabase
      .from('announcement_attachments')
      .insert({
        announcement_id: announcementId,
        file_name: `${file.name} (미리보기)`, // 실제 파일이 아님을 표시
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      return { success: false, error: `파일 정보 저장에 실패했습니다.\n오류: ${dbError.message}` };
    }
    
    return { success: true, data: dbData };
    
  } catch (error) {
    console.error('Fallback upload error:', error);
    return { success: false, error: `Fallback 업로드 중 오류가 발생했습니다.\n오류 내용: ${error instanceof Error ? error.message : '알 수 없는 오류'}` };
  }
};

// 여러 파일 업로드 (Fallback 포함)
export const uploadMultipleFiles = async (
  files: FileList | File[], 
  announcementId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; results: any[]; errors: string[]; usedFallback?: boolean }> => {
  const results = [];
  const errors = [];
  const totalFiles = files.length;
  let usedFallback = false;
  
  // Storage 설정 확인
  const storageCheck = await checkStorageSetup();
  const useStorage = storageCheck.hasStorage && storageCheck.hasBucket;
  
  if (!useStorage) {
    console.warn('Storage not available, using fallback mode');
    usedFallback = true;
  }
  
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    let result;
    
    if (useStorage) {
      // 정상 Storage 업로드 시도
      result = await uploadFile(file, announcementId);
      
      // Storage 실패 시 fallback 시도
      if (!result.success && result.error?.includes('Storage')) {
        console.warn(`Storage failed for ${file.name}, trying fallback`);
        result = await uploadFileMetadataOnly(file, announcementId);
        usedFallback = true;
      }
    } else {
      // 처음부터 fallback 사용
      result = await uploadFileMetadataOnly(file, announcementId);
    }
    
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
    
    // 진행률 업데이트
    if (onProgress) {
      onProgress(((i + 1) / totalFiles) * 100);
    }
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
    usedFallback
  };
};

// 파일 삭제
export const deleteFile = async (
  attachmentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // DB에서 파일 정보 조회
    const { data: attachment, error: fetchError } = await supabase
      .from('announcement_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();
    
    if (fetchError) {
      return { success: false, error: '파일 정보를 찾을 수 없습니다.' };
    }
    
    // Storage에서 파일 삭제
    const { error: storageError } = await supabase.storage
      .from('announcement-attachments')
      .remove([attachment.file_path]);
    
    if (storageError) {
      console.error('Storage delete error:', storageError);
    }
    
    // DB에서 파일 정보 삭제
    const { error: dbError } = await supabase
      .from('announcement_attachments')
      .delete()
      .eq('id', attachmentId);
    
    if (dbError) {
      return { success: false, error: '파일 정보 삭제에 실패했습니다.' };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('File delete error:', error);
    return { success: false, error: '파일 삭제 중 오류가 발생했습니다.' };
  }
};

// 파일 다운로드 URL 생성 (Fallback 처리 포함)
export const getFileDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    // Fallback 파일인지 확인
    if (filePath.startsWith('fallback/')) {
      console.warn('Fallback file download requested - no actual file available');
      return null;
    }
    
    const { data, error } = await supabase.storage
      .from('announcement-attachments')
      .createSignedUrl(filePath, 3600); // 1시간 유효
    
    if (error) {
      console.error('Storage download URL error:', error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Get download URL error:', error);
    return null;
  }
};

// 공지사항의 모든 첨부파일 조회
export const getAnnouncementAttachments = async (announcementId: string) => {
  try {
    const { data, error } = await supabase
      .from('announcement_attachments')
      .select('*')
      .eq('announcement_id', announcementId)
      .order('uploaded_at', { ascending: true });
    
    if (error) {
      console.error('Get attachments error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Get attachments error:', error);
    return [];
  }
};