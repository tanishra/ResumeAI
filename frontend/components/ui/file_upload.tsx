// 'use client';

// import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Upload, FileText, X, Loader2 } from 'lucide-react';
// import { Progress } from '@/components/ui/progress';

// interface FileUploadProps {
//   onFileUpload: (file: File) => void;
//   acceptedTypes: string[];
//   maxSize: number;
//   isUploading?: boolean;
//   progress?: number;
// }

// export default function FileUpload({
//   onFileUpload,
//   acceptedTypes,
//   maxSize,
//   isUploading = false,
//   progress = 0
// }: FileUploadProps) {
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
//     setError(null);
    
//     if (rejectedFiles.length > 0) {
//       setError('File type not supported or file too large');
//       return;
//     }

//     if (acceptedFiles.length > 0) {
//       const file = acceptedFiles[0];
//       setUploadedFile(file);
//       onFileUpload(file);
//     }
//   }, [onFileUpload]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: acceptedTypes.reduce((acc, type) => {
//       acc[`application/${type.replace('.', '')}`] = [type];
//       return acc;
//     }, {} as Record<string, string[]>),
//     maxSize: maxSize * 1024 * 1024,
//     multiple: false
//   });

//   const removeFile = () => {
//     setUploadedFile(null);
//     setError(null);
//   };

//   return (
//     <div className="space-y-4">
//       <motion.div
//         {...getRootProps()}
//         className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
//           isDragActive
//             ? 'border-blue-400 bg-blue-50'
//             : uploadedFile
//             ? 'border-green-400 bg-green-50'
//             : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
//         }`}
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <input {...getInputProps()} />
        
//         <AnimatePresence mode="wait">
//           {isUploading ? (
//             <motion.div
//               key="uploading"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="space-y-4"
//             >
//               <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
//               <div className="space-y-2">
//                 <p className="text-blue-600 font-medium">Uploading...</p>
//                 <Progress value={progress} className="w-48 mx-auto" />
//                 <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
//               </div>
//             </motion.div>
//           ) : uploadedFile ? (
//             <motion.div
//               key="uploaded"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className="space-y-4"
//             >
//               <FileText className="h-12 w-12 text-green-600 mx-auto" />
//               <div>
//                 <p className="font-medium text-green-800">{uploadedFile.name}</p>
//                 <p className="text-sm text-green-600">
//                   {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
//                 </p>
//               </div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeFile();
//                 }}
//                 className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="upload"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="space-y-4"
//             >
//               <Upload className="h-12 w-12 text-gray-400 mx-auto" />
//               <div>
//                 <p className="text-lg font-medium text-gray-700">
//                   {isDragActive ? 'Drop your file here' : 'Upload your resume'}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   Drag & drop or click to select ({acceptedTypes.join(', ')} up to {maxSize}MB)
//                 </p>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
//         >
//           {error}
//         </motion.div>
//       )}
//     </div>
//   );
// }


'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  isUploading?: boolean;
  progress?: number;
}

export default function FileUpload({
  onFileUpload,
  acceptedTypes,
  maxSize,
  isUploading = false,
  progress = 0
}: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('File type not supported or file too large');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[`application/${type.replace('.', '')}`] = [type];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* FIX: This is now a standard `div` handling Dropzone props and styling */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {/* FIX: A new, inner `motion.div` handles ONLY the animations, resolving the conflict */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
                <div className="space-y-2">
                  <p className="text-blue-600 font-medium">Uploading...</p>
                  <Progress value={progress} className="w-48 mx-auto" />
                  <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
                </div>
              </motion.div>
            ) : uploadedFile ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <p className="font-medium text-green-800">{uploadedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop your file here' : 'Upload your resume'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Drag & drop or click to select ({acceptedTypes.join(', ')} up to {maxSize}MB)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
