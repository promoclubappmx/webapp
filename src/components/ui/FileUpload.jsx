import React, { useRef, useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { formatFileSize } from '../../utils/fileUtils';

const FileUpload = ({
  label,
  accept = '.pdf',
  maxSizeMB = 5,
  onChange,
  onRemove,
  file = null,
  error = '',
  description = '',
  required = false,
  disabled = false,
  icon = 'Upload',
  previewType = 'none' // 'none' | 'image' | 'pdf'
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && onChange) {
      onChange(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);

    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileSelect(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleRemove = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef?.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      {!file ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50 hover:border-red-400' :'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              error ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Icon
                name={icon}
                size={24}
                className={error ? 'text-red-600' : 'text-blue-600'}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {dragActive ? (
                  'Suelta el archivo aquí'
                ) : (
                  <>
                    <span className="text-blue-600">Haz clic para subir</span> o arrastra y suelta
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {accept?.replace(/\./g, '')?.toUpperCase()} hasta {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {file?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file?.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              iconName="X"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            />
          </div>
        </div>
      )}
      {description && !error && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 font-medium mt-2 flex items-center">
          <Icon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;