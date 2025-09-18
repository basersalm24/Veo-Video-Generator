import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('google-ai-api-key') || '';
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    localStorage.setItem('google-ai-api-key', apiKey);
    onClose();
  }, [apiKey, onClose]);

  const handleClear = useCallback(() => {
    localStorage.removeItem('google-ai-api-key');
    setApiKey('');
  }, []);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [handleSave, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-2xl font-bold text-white">{t('settingsTitle')}</h2>
        
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-slate-300 mb-2">
            {t('apiKeyLabel')}
          </label>
          <input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-100"
            placeholder={t('apiKeyPlaceholder')}
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-2">{t('apiKeyDescription')}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 disabled:bg-slate-600"
            disabled={!apiKey}
          >
            {t('clearApiKeyButton')}
          </button>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
            >
                {t('closeButton')}
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                {t('saveButton')}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-white"
          aria-label={t('closeButton')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;