import React, { useState } from 'react';

const CopyButton = React.memo(({ text }) => {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };
  
    return (
      <button onClick={handleCopy} className="copy-button">
        {copied ? '✓' : '📋'}
      </button>
    );
  });

export default CopyButton;