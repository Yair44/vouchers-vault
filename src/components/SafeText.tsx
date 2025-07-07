import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';

interface SafeTextProps {
  children: string;
  allowHtml?: boolean;
  className?: string;
}

/**
 * Component that safely renders user-generated text content
 * with automatic XSS protection
 */
export const SafeText = ({ children, allowHtml = false, className }: SafeTextProps) => {
  const sanitizedContent = allowHtml 
    ? sanitizeHtml(children || '') 
    : sanitizeText(children || '');

  if (allowHtml) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }

  return <span className={className}>{sanitizedContent}</span>;
};