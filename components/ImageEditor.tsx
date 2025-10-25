
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import Icon from './Icon';

interface ImageEditorProps {
    t: (key: string) => string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ t }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedImage(null);
      setError(null);
      setOriginalImage(URL.createObjectURL(file));
      setOriginalMimeType(file.type);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim() || !originalMimeType) {
      setError("Por favor, carregue uma imagem e insira um comando de edição.");
      return;
    }
    setLoading(true);
    setError(null);
    setEditedImage(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Arquivo não encontrado.");
      setLoading(false);
      return;
    }

    try {
      const base64Image = await fileToBase64(file);
      const result = await editImage(base64Image, originalMimeType, prompt);
      setEditedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`${t('app.error.imageEdit')}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('imageEditor.title')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('imageEditor.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"
        >
          <div className="space-y-1 text-center">
            <Icon icon="upload" className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <span className="relative bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                {t('imageEditor.uploadButton')}
              </span>
              <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">{t('imageEditor.fileTypes')}</p>
          </div>
        </div>

        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={t('imageEditor.promptPlaceholder')}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <button
          onClick={handleEdit}
          disabled={loading || !originalImage || !prompt.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800"
        >
          <Icon icon="edit" className="mr-2 h-5 w-5" />
          {loading ? t('imageEditor.submitButtonLoading') : t('imageEditor.submitButton')}
        </button>
      </div>
      
      {error && <div className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900/50 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="text-center">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('imageEditor.originalLabel')}</h3>
          {originalImage ? <img src={originalImage} alt="Original" className="mt-2 rounded-lg shadow-md mx-auto max-h-96" /> : <div className="mt-2 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">{t('imageEditor.originalPlaceholder')}</div>}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('imageEditor.editedLabel')}</h3>
          <div className="mt-2 h-full min-h-[16rem] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
            {loading ? <LoadingSpinner message={t('app.loading.image')} /> : (editedImage ? <img src={editedImage} alt="Edited" className="rounded-lg shadow-md mx-auto max-h-96" /> : t('imageEditor.editedPlaceholder'))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;