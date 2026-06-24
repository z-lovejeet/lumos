'use client';

import { useState } from 'react';
import { OCRUploader } from '@/components/scanner/OCRUploader';
import { ExtractedMarksTable } from '@/components/scanner/ExtractedMarksTable';
import { ConfirmDialog } from '@/components/scanner/ConfirmDialog';
import { ParsedSubject } from '@/lib/ai/transcript-parser';
import { ScanLine, AlertCircle } from 'lucide-react';

export default function ScannerPage() {
  const [scannedData, setScannedData] = useState<ParsedSubject[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [finalData, setFinalData] = useState<ParsedSubject[] | null>(null);

  const handleScanComplete = async (rawText: string) => {
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rawText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process OCR text');
      }

      const parsed = result.data;
      if (parsed.subjects.length === 0) {
        setError('No subjects or marks could be detected from the image. Please try a clearer photo.');
        setScannedData([]);
      } else {
        setScannedData(parsed.subjects);
      }
    } catch (err: any) {
      setError('Failed to extract structured data from OCR text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = (finalSubjects: ParsedSubject[]) => {
    setFinalData(finalSubjects);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async (semester: number) => {
    // Phase 9 DB integration (mocked until Phase 10 backend integration)
    alert(`Saved ${finalData?.length} subjects to Semester ${semester}!`);
    setIsConfirmOpen(false);
    setScannedData(null);
    setFinalData(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ScanLine className="w-8 h-8" />
          Marksheet Scanner
        </h1>
        <p className="text-muted-foreground">
          Instantly digitize your academic marks. Take a photo of your marksheet and AI will extract your grades using secure, in-browser OCR.
        </p>
      </div>

      {!scannedData && !isProcessing && (
        <OCRUploader onScanComplete={handleScanComplete} />
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Structuring data with AI Fallback...</p>
        </div>
      )}

      {error && !isProcessing && (
        <div className="flex items-start gap-2 p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {scannedData && !isProcessing && (
        <div className="space-y-4 fade-in-up">
          <h2 className="text-xl font-semibold">Verify Extracted Data</h2>
          <p className="text-sm text-muted-foreground">
            Please review the grades we detected. You can edit any mistakes before saving.
          </p>
          <ExtractedMarksTable 
            initialSubjects={scannedData}
            onSave={handleSave}
            onCancel={() => setScannedData(null)}
          />
        </div>
      )}

      {isConfirmOpen && finalData && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmSave}
          subjectCount={finalData.length}
        />
      )}
    </div>
  );
}
