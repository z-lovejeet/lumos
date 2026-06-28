'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(format);
      
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedSemesters: 'all' })
      });

      if (!response.ok) throw new Error('Export failed');

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumos-report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error(error);
      alert('Failed to generate export. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Export Center</h1>
        <p className="text-muted-foreground mt-2">
          Download your academic records, grades, and analytics in your preferred format.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* PDF Export */}
        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle>PDF Report</CardTitle>
            <CardDescription>
              Professional academic report including SGPA, CGPA, and subject-wise grades.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={loading !== null}
            >
              {loading === 'pdf' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        {/* Excel Export */}
        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <CardTitle>Excel Spreadsheet</CardTitle>
            <CardDescription>
              Complete dataset in XLSX format, perfect for custom charting and analysis.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={loading !== null}
            >
              {loading === 'excel' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Download Excel
            </Button>
          </CardFooter>
        </Card>

        {/* CSV Export */}
        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4">
              <FileJson className="h-6 w-6" />
            </div>
            <CardTitle>CSV Data</CardTitle>
            <CardDescription>
              Lightweight, comma-separated values for easy import into other tools.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={loading !== null}
            >
              {loading === 'csv' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Download CSV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
