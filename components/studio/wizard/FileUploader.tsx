import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';

export const FileUploader: React.FC = () => {
  const { uploadedFiles, setUploadedFiles } = useWizard();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const newFiles = Array.from(e.dataTransfer.files);
       setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  }, [uploadedFiles, setUploadedFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50'
          }
        `}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/*"
        />
        
        <div className="pointer-events-none">
          <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">
            Click or drag images here
          </h3>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Upload the photos you want to animate. High resolution (2048px+) recommended.
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="relative group aspect-square bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
              <img 
                src={URL.createObjectURL(file)} 
                alt="preview" 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
