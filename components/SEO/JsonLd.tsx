import React from 'react';

interface JsonLdProps {
  data: object | object[];
}

/**
 * JsonLd Component
 * Renders structured data (JSON-LD) for SEO
 */
const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  const jsonLdData = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLdData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2),
          }}
        />
      ))}
    </>
  );
};

export default JsonLd;
