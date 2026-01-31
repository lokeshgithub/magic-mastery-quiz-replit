import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (fileName: string, content: string) => void;
}

export const UploadArea = ({ onUpload }: UploadAreaProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onUpload(file.name, content);
        }
      };
      reader.readAsText(file);
    });
    
    // Reset input
    event.target.value = '';
  }, [onUpload]);

  return (
    <motion.label
      className="block cursor-pointer mb-6"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input
        type="file"
        accept=".csv"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center transition-all hover:border-primary hover:bg-primary/5">
        <motion.div 
          className="inline-flex p-4 bg-primary/10 rounded-full mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Upload className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="font-semibold text-foreground mb-1">
          📁 Click to upload question bank CSV files
        </p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Upload your magical question banks here!
        </p>
      </div>
    </motion.label>
  );
};
