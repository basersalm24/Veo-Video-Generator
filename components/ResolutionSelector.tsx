import React from 'react';
import { Resolution } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ResolutionSelectorProps {
  selected: Resolution;
  onChange: (value: Resolution) => void;
}

const RESOLUTION_OPTIONS = Object.values(Resolution);

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ selected, onChange }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {t('resolutionLabel')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {RESOLUTION_OPTIONS.map((res) => (
          <button
            key={res}
            type="button"
            onClick={() => onChange(res)}
            className={`p-3 rounded-lg border-2 transition-colors ${
              selected === res
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-300'
            }`}
          >
            {res}
          </button>
        ))}
      </div>
    </div>
  );
};
