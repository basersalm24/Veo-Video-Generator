import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ResolutionSelector } from './components/ResolutionSelector';
import VideoResult from './components/VideoResult';
import LoadingOverlay from './components/LoadingOverlay';
import { generateVideo } from './services/geminiService';
import { AspectRatio, Resolution } from './types';
import { useTranslation } from './hooks/useTranslation';

type ResultData = {
  prompt: string;
  negativePrompt: string;
  sourceImageUrl: string | null;
};

function App() {
  const { t, language } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SixteenToNine);
  const [resolution, setResolution] = useState<Resolution>(Resolution.HD);
  const [image, setImage] = useState<{ imageBytes: string; mimeType: string; } | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (file.size > 4 * 1024 * 1024) { // 4MB size limit
      setError(t('imageSizeError'));
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImage({
        imageBytes: base64String,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(URL.createObjectURL(file));

  }, [t, imagePreviewUrl]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);
  
  const handleRemoveImage = useCallback(() => {
    setImage(undefined);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (error) setError(null);
    setPrompt(e.target.value);
  };
  
  const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (error) setError(null);
    setNegativePrompt(e.target.value);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [processFile]);


  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt) {
      setError(t('promptRequiredError'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setResultData(null);
    setProgressMessage(t('progress.initializing'));

    try {
      const url = await generateVideo(prompt, negativePrompt, aspectRatio, resolution, image, (message) => {
        setProgressMessage(message);
      });
      setVideoUrl(url);
      setResultData({ prompt, negativePrompt, sourceImageUrl: imagePreviewUrl });
    } catch (err: any) {
      // Handle specific, translatable error keys from the service layer.
      if (err.message === 'apiKeyRequiredError') {
        setError(t(err.message));
      } else {
        setError(err.message || t('progress.error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, aspectRatio, resolution, image, t, imagePreviewUrl]);

  const handleClear = useCallback(() => {
    setPrompt('');
    setNegativePrompt('');
    handleRemoveImage();
    setError(null);
    setVideoUrl(null);
    setResultData(null);
  }, [handleRemoveImage]);
  
  const handleInspireMe = useCallback(() => {
    const prompts: string[] = t('examplePrompts');
    if (Array.isArray(prompts) && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      const randomPrompt = prompts[randomIndex];
      setPrompt(randomPrompt);
      if (error) setError(null);
    }
  }, [t, error]);

  const isFormEmpty = !prompt && !negativePrompt && !image;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className={`bg-slate-900 min-h-screen text-white font-sans ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Header />
      {isLoading && <LoadingOverlay message={progressMessage} />}
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="block text-lg font-medium text-slate-200">
                  {t('promptLabel')}
                </label>
                <button
                  type="button"
                  onClick={handleInspireMe}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.586l.293-.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414l.707-.707A1 1 0 015 3.586V3a1 1 0 011-1zM10 2a1 1 0 011 1v1.586l.293-.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0L9.414 6.707a1 1 0 010-1.414l.707-.707A1 1 0 0111 3.586V3a1 1 0 011-1zM15 2a1 1 0 011 1v1.586l.293-.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0L14.414 6.707a1 1 0 010-1.414l.707-.707a1 1 0 011.06-.051V3a1 1 0 011-1zM5 10a1 1 0 011 1v1.586l.293-.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414l.707-.707A1 1 0 015 11.586V11a1 1 0 011-1zM10 10a1 1 0 011 1v1.586l.293-.293a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414l.707-.707A1 1 0 0110 11.586V11a1 1 0 011-1z" clipRule="evenodd" />
                    <path d="M10 4.5a.5.5 0 00-.5.5v1.586l-.293-.293a.5.5 0 00-.707 0l-.707.707a.5.5 0 000 .707l1.586 1.586a.5.5 0 00.707 0l1.586-1.586a.5.5 0 000-.707l-.707-.707a.5.5 0 00-.707 0L10.5 6.586V5a.5.5 0 00-.5-.5z" />
                  </svg>
                  <span>{t('inspireMe')}</span>
                </button>
              </div>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={handlePromptChange}
                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-100"
                placeholder={t('promptPlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="negative-prompt" className="block text-lg font-medium text-slate-200 mb-2">
                {t('negativePromptLabel')}
              </label>
              <textarea
                id="negative-prompt"
                rows={2}
                value={negativePrompt}
                onChange={handleNegativePromptChange}
                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-100"
                placeholder={t('negativePromptPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('imageUploadLabel')}
              </label>
              {imagePreviewUrl ? (
                <div className="relative w-40 h-40">
                  <img src={imagePreviewUrl} alt={t('imagePreviewAlt')} className="w-full h-full object-cover rounded-lg shadow-md" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-[-0.5rem] right-[-0.5rem] rtl:right-auto rtl:left-[-0.5rem] bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
                    aria-label={t('removeImage')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  onDragEnter={(e) => handleDragEvents(e, true)}
                  onDragOver={(e) => handleDragEvents(e, true)}
                  onDragLeave={(e) => handleDragEvents(e, false)}
                  onDrop={handleDrop}
                  className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-slate-700' : 'border-slate-600'}`}
                >
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-blue-500 px-1">
                        <span>{t('uploadFile')}</span>
                        <input ref={fileInputRef} id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" />
                      </label>
                      <p className="px-1">{t('dragAndDrop')}</p>
                    </div>
                    <p className="text-xs text-slate-500">{t('imageFormats')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AspectRatioSelector selected={aspectRatio} onChange={setAspectRatio} />
              <ResolutionSelector selected={resolution} onChange={setResolution} />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleClear}
                disabled={isFormEmpty}
                className="w-full sm:w-auto flex-shrink-0 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {t('clearButton')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
              >
                {isLoading ? t('generatingButton') : t('generateButton')}
              </button>
            </div>
            {error && <p className="text-red-400 text-center mt-2">{error}</p>}
          </form>

          {videoUrl && resultData && <VideoResult videoUrl={videoUrl} {...resultData} />}
        </div>
      </main>
    </div>
  );
}

export default App;