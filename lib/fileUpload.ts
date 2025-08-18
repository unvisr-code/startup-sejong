import { supabase } from './supabase';

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
  // 한글, 영문, 숫자, 점, 하이픈, 언더스코어만 허용
  return fileName.replace(/[^가-힣a-zA-Z0-9.-_]/g, '_');
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
    // 파일 검증
    if (!validateFileType(file)) {
      return { success: false, error: '지원하지 않는 파일 형식입니다.' };
    }
    
    if (!validateFileSize(file)) {
      return { success: false, error: '파일 크기가 10MB를 초과합니다.' };
    }
    
    // 파일 이름 생성 (중복 방지)
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `announcements/${announcementId}/${fileName}`;
    
    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('announcement-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: '파일 업로드에 실패했습니다.' };
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
    return { success: false, error: '파일 업로드 중 오류가 발생했습니다.' };
  }
};

// 여러 파일 업로드
export const uploadMultipleFiles = async (
  files: FileList | File[], 
  announcementId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; results: any[]; errors: string[] }> => {
  const results = [];
  const errors = [];
  const totalFiles = files.length;
  
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const result = await uploadFile(file, announcementId);
    
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
    errors
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

// 파일 다운로드 URL 생성
export const getFileDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data } = await supabase.storage
      .from('announcement-attachments')
      .createSignedUrl(filePath, 3600); // 1시간 유효
    
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