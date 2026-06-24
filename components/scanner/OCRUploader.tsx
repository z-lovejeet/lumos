'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import Tesseract from 'tesseract.js';

interface OCRUploaderProps {
  onScanComplete: (text: string) => void;
}

export function OCRUploader({ onScanComplete }: OCRUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    // Validate
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPG and PNG images are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatusText('Initializing OCR Engine...');

    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusText(`Scanning... ${Math.round(m.progress * 100)}%`);
          } else {
            setStatusText(m.status);
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      onScanComplete(text);
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        {!loading ? (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-32 flex flex-col gap-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span>Take Photo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 flex flex-col gap-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span>Upload Image</span>
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="w-full max-w-xs space-y-2 text-center">
              <p className="text-sm font-medium">{statusText}</p>
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              Processing runs entirely in your browser. No sensitive images are uploaded to any server.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
