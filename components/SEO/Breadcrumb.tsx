import React from 'react';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { generateBreadcrumbSchema } from '../../lib/seo';
import JsonLd from './JsonLd';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * Provides visual navigation and structured data for SEO
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  // Always include home as first item
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '홈', url: '/' },
    ...items,
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav
        className={`flex items-center space-x-2 text-sm ${className}`}
        aria-label="Breadcrumb"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={item.url}>
              {index > 0 && (
                <FaChevronRight className="text-gray-400" size={10} />
              )}
              {isLast ? (
                <span
                  className="text-gray-700 font-medium"
                  aria-current="page"
                >
                  {isFirst && <FaHome className="inline mr-1" size={14} />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {isFirst && <FaHome className="inline mr-1" size={14} />}
                  {!isFirst && item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};

export default Breadcrumb;
