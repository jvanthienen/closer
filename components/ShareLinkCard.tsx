'use client';

import React, { useState } from 'react';
import HandDrawnCard from './HandDrawnCard';
import HandDrawnButton from './HandDrawnButton';

interface ShareLinkCardProps {
  shareToken: string;
}

export default function ShareLinkCard({ shareToken }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${shareToken}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <HandDrawnCard borderColor="cobalt">
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-center">Your Shareable Link</h3>

        <div className="bg-gray-50 p-3 rounded-lg border-2 border-dashed border-gray-300">
          <code className="text-sm text-gray-700 break-all">
            {shareUrl}
          </code>
        </div>

        <div className="flex gap-2 justify-center">
          <HandDrawnButton
            color="cobalt"
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </HandDrawnButton>

          <HandDrawnButton
            color="sage"
            variant="outline"
            onClick={() => window.open(shareUrl, '_blank')}
          >
            👁️ Preview
          </HandDrawnButton>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Share this link with friends so they can see when you're free
        </p>
      </div>
    </HandDrawnCard>
  );
}
