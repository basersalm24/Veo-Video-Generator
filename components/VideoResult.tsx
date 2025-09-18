import React, { useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface VideoResultProps {
  videoUrl: string;
  prompt: string;
  negativePrompt?: string;
  sourceImageUrl?: string | null;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, prompt, negativePrompt, sourceImageUrl }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [prompt]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-slate-100 mb-4 text-center">{t('videoResultTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <video controls src={videoUrl} className="w-full rounded-md" />
          <div className="mt-4 text-center">
            <a
              href={videoUrl}
              download="generated-video.mp4"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {t('downloadVideo')}
            </a>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-4">
          <div>
            <h3 className="font-semibold text-slate-300">{t('resultPrompt')}</h3>
            <div className="mt-1 bg-slate-700 p-3 rounded-md text-slate-100 relative">
              <p>{prompt}</p>
              <button onClick={handleCopy} className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-slate-400 hover:text-white transition-colors" title={t('copyPrompt')}>
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                )}
              </button>
            </div>
          </div>
          {negativePrompt && (
            <div>
              <h3 className="font-semibold text-slate-300">{t('resultNegativePrompt')}</h3>
              <p className="mt-1 bg-slate-700 p-3 rounded-md text-slate-100">{negativePrompt}</p>
            </div>
          )}
          {sourceImageUrl && (
            <div>
              <h3 className="font-semibold text-slate-300">{t('resultSourceImage')}</h3>
              <img src={sourceImageUrl} alt={t('imagePreviewAlt')} className="mt-1 w-32 h-32 object-cover rounded-lg shadow-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoResult;
