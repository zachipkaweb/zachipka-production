'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { getCloudinaryUploadParamsAction } from '../actions';

/**
 * Optimizes an image file on the client before uploading to Cloudinary.
 * Resizes images exceeding 2560px on either dimension and compresses files > 2MB via HTML5 Canvas.
 */
async function optimizeImage(file) {
  if (!file || file.type === 'image/svg+xml' || typeof window === 'undefined') {
    return file;
  }

  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_WIDTH = 2560;
      const MAX_HEIGHT = 2560;
      let { width, height } = img;

      const needsResize = width > MAX_WIDTH || height > MAX_HEIGHT;
      const needsCompress = file.size > 2 * 1024 * 1024; // > 2MB

      if (!needsResize && !needsCompress) {
        return resolve(file);
      }

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' && file.size < 3 * 1024 * 1024 ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
          } else {
            const ext = mimeType === 'image/png' ? '.png' : '.jpg';
            const newName = file.name.replace(/\.[^.]+$/, ext);
            resolve(new File([blob], newName, { type: mimeType, lastModified: Date.now() }));
          }
        },
        mimeType,
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Direct client-to-Cloudinary upload helper using signed/unsigned upload parameters.
 */
async function uploadToCloudinary(file, subfolder) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      `Файл "${file.name}" завеликий (${(file.size / (1024 * 1024)).toFixed(1)} МБ). Максимум для Cloudinary — 10 МБ.`
    );
  }

  const params = await getCloudinaryUploadParamsAction(subfolder);
  if (params?.error) {
    throw new Error(params.error);
  }

  const { cloudName, uploadPreset, folder, apiKey, timestamp, signature } = params;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('asset_folder', folder);

  if (apiKey && timestamp && signature) {
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  }

  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(`Мережева помилка під час надсилання фото: ${networkErr.message || 'Перевірте інтернет'}`);
  }

  if (!res.ok) {
    let cloudMsg = '';
    try {
      const data = await res.json();
      cloudMsg = data?.error?.message;
    } catch {}

    if (cloudMsg) {
      throw new Error(`Помилка Cloudinary: ${cloudMsg}`);
    }
    throw new Error(`Помилка завантаження фото в Cloudinary (HTTP ${res.status}: ${res.statusText || 'Невдача'})`);
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * ImageDropzone Component
 * Supports single or multi-file image uploads via drag-and-drop or file selector.
 * Manages preview states, progress feedback, removals, and binds to a hidden form input.
 */
export default function ImageDropzone({
  name,
  defaultValue,
  multiple = false,
  label,
  folder,
  slugInputId,
  className = '',
}) {
  const [urls, setUrls] = useState(() => {
    if (multiple) {
      return Array.isArray(defaultValue) ? defaultValue.filter(Boolean) : [];
    }
    return defaultValue ? [defaultValue] : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const isLockedSingle = !multiple && urls.length > 0;

  const resolveSubfolder = () => {
    if (slugInputId && typeof document !== 'undefined') {
      const inputEl = document.getElementById(slugInputId);
      if (inputEl?.value?.trim()) {
        return inputEl.value.trim();
      }
    }
    return folder || 'general';
  };

  const handleFiles = async (fileList) => {
    if (isLockedSingle || isUploading) return;

    const files = Array.from(fileList || []).filter(
      (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(f.name)
    );
    if (!files.length) return;

    const filesToUpload = multiple ? files : [files[0]];
    const targetSubfolder = resolveSubfolder();

    setIsUploading(true);
    setUploadProgress(null);
    setError(null);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (filesToUpload.length > 1) {
          setUploadProgress(`Завантаження ${i + 1} з ${filesToUpload.length}...`);
        } else {
          setUploadProgress('Завантаження фото в хмару...');
        }

        const optimizedFile = await optimizeImage(file);
        const url = await uploadToCloudinary(optimizedFile, targetSubfolder);
        uploadedUrls.push(url);
      }

      setUrls((prev) => (multiple ? [...prev, ...uploadedUrls] : [uploadedUrls[0]]));
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити фото');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const hiddenValue = multiple ? urls.join('\n') : urls[0] || '';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray/40">
          {label}
        </label>
      )}

      <input type="hidden" name={name} value={hiddenValue} />

      <div
        onClick={() => {
          if (!isLockedSingle && !isUploading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLockedSingle && !isUploading) {
            setIsDragActive(true);
          }
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          if (!isLockedSingle && !isUploading) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`border-2 border-dashed p-3 transition-colors flex-1 flex flex-col justify-center items-center min-h-27.5 ${
          isLockedSingle
            ? 'border-blue-500/20 bg-blue-500/5 cursor-default'
            : isDragActive
              ? 'border-blue-500 bg-blue-500/20 cursor-pointer'
              : 'border-blue-500/20 hover:border-blue-500/50 bg-blue-500/5 cursor-pointer'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          disabled={isLockedSingle || isUploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {!multiple && urls.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 shrink-0 border border-gray/20 bg-black overflow-hidden">
              <Image
                src={urls[0]}
                alt="Головне фото"
                fill
                sizes="64px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(0);
                }}
                className="absolute top-0.5 right-0.5 bg-black/80 text-white w-5 h-5 text-xs flex items-center justify-center hover:bg-red cursor-pointer"
                title="Видалити фото"
              >
                ✕
              </button>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray/60 text-left">
              Фото вибрано. Видаліть (✕), щоб вибрати інше
            </span>
          </div>
        ) : (
          <div className="py-1 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray/70">
              {isUploading
                ? uploadProgress || 'Завантаження в хмару...'
                : isDragActive
                  ? 'Відпустіть файли тут...'
                  : multiple
                    ? 'Перетягніть фото сюди або клікніть (можна декілька)'
                    : 'Перетягніть головне фото або клікніть для вибору'}
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-bold text-red">{error}</p>}

      {multiple && urls.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {urls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group w-20 h-20 border border-gray/20 bg-black overflow-hidden"
            >
              <Image
                src={url}
                alt={`Прев'ю ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/80 text-white w-5 h-5 text-xs flex items-center justify-center hover:bg-red cursor-pointer"
                title="Видалити фото"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}