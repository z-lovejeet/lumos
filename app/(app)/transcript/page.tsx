'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ParsedTranscript, ParsedSubject } from '@/lib/ai/transcript-parser';

export default function TranscriptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ParsedTranscript | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse transcript');
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // In Phase 9: Bulk insert marks from OCR/transcript import
    alert("Saving data to database... (To be implemented in DB route)");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Transcript Intelligence</h1>
        <p className="text-muted-foreground">
          Upload your university transcript PDF to automatically extract semesters, subjects, and grades.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Transcript</CardTitle>
          <CardDescription>Only PDF files are supported (max 10MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
            {loading ? 'Parsing PDF with AI...' : 'Extract Academic Data'}
          </Button>
        </CardFooter>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Extracted Academic Data
            </CardTitle>
            <CardDescription>
              Please verify the extracted information below before saving to your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="text-xl font-semibold">{data.semester || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SGPA</p>
                <p className="text-xl font-semibold">{data.sgpa || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Subjects & Grades</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Credits</th>
                      <th className="px-4 py-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.subjects.length > 0 ? (
                      data.subjects.map((sub, i) => (
                        <tr key={i} className="bg-background">
                          <td className="px-4 py-3">{sub.name}</td>
                          <td className="px-4 py-3">{sub.credits}</td>
                          <td className="px-4 py-3 font-semibold">{sub.grade || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                          No subjects could be extracted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full" disabled={data.subjects.length === 0}>
              Confirm & Save to Profile
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
