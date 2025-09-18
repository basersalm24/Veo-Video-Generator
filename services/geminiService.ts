import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Resolution } from '../types';

interface ImageInput {
  imageBytes: string;
  mimeType: string;
}

/**
 * Generates a video using the Gemini API.
 * @param prompt The text prompt for the video.
 * @param negativePrompt An optional text prompt of things to avoid.
 * @param aspectRatio The desired aspect ratio for the video.
 * @param resolution The desired resolution for the video.
 * @param image An optional image to use as a basis for the video.
 * @param onProgress A callback function to report progress.
 * @returns A promise that resolves to a local URL for the generated video blob.
 */
export const generateVideo = async (
  prompt: string,
  negativePrompt: string,
  aspectRatio: AspectRatio,
  resolution: Resolution,
  image: ImageInput | undefined,
  onProgress: (message: string) => void
): Promise<string> => {
  const apiKey = localStorage.getItem('google-ai-api-key');
  if (!apiKey) {
    // Throw a key that the UI can translate.
    throw new Error("apiKeyRequiredError");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    onProgress("جارٍ تهيئة الطلب...");

    const config: {
        numberOfVideos: number;
        aspectRatio: AspectRatio;
        resolution: Resolution;
        negativePrompt?: string;
    } = {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
        resolution: resolution,
    };

    if (negativePrompt) {
        config.negativePrompt = negativePrompt;
    }

    const params: {
        model: string;
        prompt: string;
        config: typeof config;
        image?: ImageInput;
    } = {
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: config,
    };

    if (image) {
        params.image = image;
    }

    let operation = await ai.models.generateVideos(params);

    onProgress("تم إرسال الطلب، جارٍ إنشاء الفيديو...");

    while (!operation.done) {
      onProgress("جارٍ معالجة الفيديو... قد يستغرق هذا بضع دقائق.");
      // Poll for the operation status every 10 seconds as recommended.
      await new Promise(resolve => setTimeout(resolve, 10000)); 
      operation = await ai.operations.getVideosOperation({ operation });

      if (operation.error) {
        const errorMessage = (operation.error as { message?: string })?.message || "Video generation failed with an unknown error.";
        throw new Error(`Video generation failed: ${errorMessage}`);
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("تعذّر استرداد رابط تنزيل الفيديو.");
    }

    onProgress("تم إنشاء الفيديو بنجاح، جارٍ التنزيل...");

    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`فشل تنزيل الفيديو: ${response.statusText}`);
    }

    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(blob);
    
    onProgress("الفيديو جاهز.");

    return videoUrl;

  } catch (error) {
    console.error("Error generating video:", error);
    // Re-throw the original error message (which might be a translation key)
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف أثناء إنشاء الفيديو.";
    onProgress(`خطأ: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};