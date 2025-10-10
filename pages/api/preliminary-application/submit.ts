import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

interface ApplicationData {
  name: string;
  email: string;
  phone_number: string;
  department: string;
  grade: number;
  age: number;
  gpa: string;
  has_startup_item: boolean;
  self_introduction: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: ApplicationData = req.body;

    // Validate required fields
    if (!data.name || !data.email || !data.phone_number || !data.department || !data.grade || !data.age) {
      return res.status(400).json({
        error: '필수 항목을 모두 입력해주세요.'
      });
    }

    // Validate name
    const name = (data.name || '').trim();
    if (name.length < 1 || name.length > 50) {
      return res.status(400).json({
        error: '이름은 1~50자 사이로 입력해주세요.'
      });
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const email = (data.email || '').trim();
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: '올바른 이메일 형식이 아닙니다.'
      });
    }

    // Validate phone number format (Korean mobile)
    const phoneRegex = /^010-?\d{4}-?\d{4}$/;
    if (!phoneRegex.test(data.phone_number.replace(/-/g, ''))) {
      return res.status(400).json({ 
        error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' 
      });
    }

    // Validate grade
    if (data.grade < 1 || data.grade > 4) {
      return res.status(400).json({ 
        error: '학년은 1-4학년 사이여야 합니다.' 
      });
    }

    // Validate age
    if (data.age < 18 || data.age > 100) {
      return res.status(400).json({ 
        error: '올바른 나이를 입력해주세요.' 
      });
    }

    // Validate self introduction length
    if (data.self_introduction && data.self_introduction.length > 300) {
      return res.status(400).json({ 
        error: '자기소개는 300자 이내로 작성해주세요.' 
      });
    }

    // Get IP address and user agent for tracking
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const user_agent = req.headers['user-agent'] || '';

    // Format phone number with hyphens
    const formattedPhone = data.phone_number.replace(/[^0-9]/g, '');
    const formatted_phone_number = formattedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

    // Insert into database
    const { error: insertError } = await supabase
      .from('preliminary_applications')
      .insert({
        name,
        email,
        phone_number: formatted_phone_number,
        department: data.department,
        grade: data.grade,
        age: data.age,
        gpa: data.gpa || '미입력',
        has_startup_item: data.has_startup_item || false,
        self_introduction: data.self_introduction || '',
        ip_address: ip_address.toString(),
        user_agent: user_agent
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      
      // Check if it's a duplicate phone number
      if (insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
        return res.status(400).json({ 
          error: '이미 신청하신 전화번호입니다.' 
        });
      }
      
      return res.status(500).json({ 
        error: '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }

    // Success response
    res.status(200).json({ 
      success: true,
      message: '예비 신청이 완료되었습니다.' 
    });

  } catch (error: any) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
  }
}
