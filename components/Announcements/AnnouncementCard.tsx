import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaCalendar, FaTag, FaThumbtack } from 'react-icons/fa';
import { Announcement } from '../../lib/supabase';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'important':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'important':
        return '중요';
      case 'academic':
        return '학사';
      case 'event':
        return '행사';
      default:
        return '일반';
    }
  };

  return (
    <Link href={`/announcements/${announcement.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {announcement.is_pinned && (
              <FaThumbtack className="text-primary" />
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(announcement.category)}`}>
              <FaTag className="inline mr-1" size={10} />
              {getCategoryLabel(announcement.category)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaCalendar className="mr-1" />
            {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {announcement.title}
        </h3>
        
        <div 
          className="text-gray-600 text-sm line-clamp-3"
          dangerouslySetInnerHTML={{ 
            __html: announcement.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
          }}
        />
      </div>
    </Link>
  );
};

export default AnnouncementCard;