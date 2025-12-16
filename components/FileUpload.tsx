import React, { useRef } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Subscription } from '../types';
import { parseExcelData } from '../utils/excelParser';

interface FileUploadProps {
  onDataLoaded: (data: Subscription[], source: 'LOCAL' | 'CLOUD') => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const processed = parseExcelData(data as string);
        onDataLoaded(processed, 'LOCAL');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative group perspective-1000 h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full h-full min-h-[250px] p-8 border-2 border-dashed border-cyan-500/30 rounded-2xl bg-gray-900/50 backdrop-blur-sm hover:border-cyan-400 hover:bg-cyan-950/20 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col items-center justify-center gap-4 text-center"
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
        
        <div className="relative z-10 p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
          <FileSpreadsheet className="w-12 h-12 text-cyan-400" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-display font-bold text-white mb-2 tracking-widest uppercase">
            Upload Locale
          </h3>
          <p className="text-cyan-200/60 font-light text-sm">
            Trascina o clicca per caricare un file Excel dal tuo PC.
          </p>
        </div>
      </button>
    </div>
  );
};