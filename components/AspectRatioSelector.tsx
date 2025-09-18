import React from 'react';
import { AspectRatio } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onChange: (value: AspectRatio) => void;
}

const ASPECT_RATIO_OPTIONS = Object.values(AspectRatio);

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onChange }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {t('aspectRatioLabel')}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {ASPECT_RATIO_OPTIONS.map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => onChange(ratio)}
            className={`p-3 rounded-lg border-2 transition-colors ${
              selected === ratio
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-300'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
};
