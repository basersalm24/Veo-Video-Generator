import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

function getNestedTranslation(translations: any, key: string): any {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, translations);
}


export const useTranslation = () => {
  const { language, translations } = useContext(LanguageContext);
  
  const t = (key: string): any => {
    return getNestedTranslation(translations, key) || key;
  };

  return { t, language };
};