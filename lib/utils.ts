// Utility functions

/**
 * Remove HTML tags from a string and return plain text
 * @param html - HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags and replace with space
  return html
    .replace(/<[^>]*>/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format text for push notification body
 * @param html - HTML content
 * @param maxLength - Maximum length for notification body
 * @returns Formatted plain text for notification
 */
export const formatNotificationBody = (html: string, maxLength: number = 100): string => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};