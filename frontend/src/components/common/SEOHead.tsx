import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  jsonLd?: Record<string, any>;
}

/**
 * Atomic SEOHead Component
 * Dynamically injects page title, meta tags, and Schema.org JSON-LD structured data
 * into the document head using native React DOM management.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ title, description, url, image, jsonLd }) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title ? `${title} | LMS Platform` : 'LMS Platform';

    // Helper to update or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard & OpenGraph / Twitter Meta Tags
    setMetaTag('name', 'description', description || '');
    setMetaTag('property', 'og:title', title || '');
    setMetaTag('property', 'og:description', description || '');
    setMetaTag('property', 'og:type', 'website');
    if (url) setMetaTag('property', 'og:url', url);
    if (image) setMetaTag('property', 'og:image', image);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || '');
    setMetaTag('name', 'twitter:description', description || '');
    if (image) setMetaTag('name', 'twitter:image', image);

    // 3. Schema.org JSON-LD Structured Data
    let scriptTag = document.getElementById('json-ld-structured-data') as HTMLScriptElement;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-structured-data';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, url, image, jsonLd]);

  return null;
};
