import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** A package README. Package content is untrusted: rendered Markdown is
 *  sanitized before it reaches the page. */
export default function Readme({ markdown }) {
  const html = useMemo(() => {
    if (!markdown) return '';
    return DOMPurify.sanitize(marked.parse(markdown, { async: false }), {
      USE_PROFILES: { html: true },
    });
  }, [markdown]);
  if (!html) return <p><em>This package has no README.</em></p>;
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
