// src/components/dashboard/ImageKitUploader.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import ImageKitService from '@/services/imagekit.service';

interface ImageKitUploaderProps {
  currentLogo?: string | null;
  onUploadSuccess: (url: string) => void;
  onError?: (error: string) => void;
}

interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
}

const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({
  currentLogo,
  onUploadSuccess,
  onError,
}) => {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [authParams, setAuthParams] = useState<{ signature: string; token: string; expire: number } | null>(null);
  const ikUploadRef = useRef<any>(null);

  // Obtener parámetros de autenticación al montar el componente
  useEffect(() => {
    const fetchAuthParams = async () => {
      try {
        const params = await ImageKitService.getAuthParameters();
        setAuthParams(params);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al inicializar ImageKit';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    };
    fetchAuthParams();
  }, [onError]);

  // Validación de archivo
  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)';
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return 'El archivo no debe superar los 5MB';
    }

    return null;
  };

  // Manejar selección de archivo mediante el componente IKUpload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      // Reset input
      event.target.value = '';
      return;
    }

    setError(null);
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Manejar drag & drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      return;
    }

    setError(null);
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Disparar el click en el componente IKUpload
    if (ikUploadRef.current) {
      // Crear un nuevo DataTransfer y asignar el archivo
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Buscar el input file dentro del IKUpload
      const input = ikUploadRef.current.querySelector('input[type="file"]');
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  // Simular progreso durante la subida
  const simulateProgress = () => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Callbacks de ImageKit
  const onSuccess = (res: UploadResponse) => {
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      onUploadSuccess(res.url);
    }, 500);
  };

  const onUploadError = (err: any) => {
    setIsUploading(false);
    setUploadProgress(0);
    const errorMessage = err?.message || 'Error al subir la imagen';
    setError(errorMessage);
    if (onError) onError(errorMessage);
  };

  const onUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(10);
    simulateProgress();
  };

  return (
    <div className="w-full">
      {/* ImageKit Upload Component (visible pero estilizado) */}
      {authParams && (
        <IKContext
          publicKey="public_cHPal5YMqfrS1Exwc/qxpgUD1sQ="
          urlEndpoint="https://ik.imagekit.io/citayaapp"
          authenticator={async () => ({
            signature: authParams.signature,
            token: authParams.token,
            expire: authParams.expire,
          })}
        >
          <div
            ref={ikUploadRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
          >
            {/* Preview de imagen */}
            {preview && !isUploading && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-lg shadow-md object-contain"
                />
              </div>
            )}

            {/* Icono y texto */}
            {!preview && !isUploading && (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Haz click para seleccionar
                  </span>
                  {' '}o arrastra una imagen aquí
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP hasta 5MB</p>
              </div>
            )}

            {/* Barra de progreso */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Subiendo imagen...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{uploadProgress}%</span>
              </div>
            )}

            {/* IKUpload component - estilizado para ser invisible pero funcional */}
            <div className="absolute inset-0 opacity-0">
              <IKUpload
                fileName={`logo-${Date.now()}.jpg`}
                folder="/logos"
                tags={['logo', 'negocio']}
                useUniqueFileName={true}
                isPrivateFile={false}
                onError={onUploadError}
                onSuccess={onSuccess}
                onUploadStart={onUploadStart}
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                validateFile={(file) => {
                  const error = validateFile(file);
                  if (error) {
                    setError(error);
                    if (onError) onError(error);
                    return false;
                  }
                  return true;
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              />
            </div>
          </div>
        </IKContext>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Botón para cambiar imagen (si ya hay preview) */}
      {preview && !isUploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            setError(null);
          }}
          className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cambiar imagen
        </button>
      )}
    </div>
  );
};

export default ImageKitUploader;
