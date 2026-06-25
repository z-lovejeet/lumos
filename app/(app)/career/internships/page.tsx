"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InternshipApplication } from "@/types/career";

export default function InternshipsPage() {
  const [apps, setApps] = useState<InternshipApplication[]>([
    { id: '1', companyName: 'Google', role: 'SWE Intern', status: 'interviewing', appliedDate: '2026-01-15' },
    { id: '2', companyName: 'Microsoft', role: 'SDE Intern', status: 'applied', appliedDate: '2026-02-10' },
    { id: '3', companyName: 'Startup Inc', role: 'Frontend Intern', status: 'offered', appliedDate: '2026-03-01' },
    { id: '4', companyName: 'Stripe', role: 'Backend Intern', status: 'rejected', appliedDate: '2026-01-20' },
  ]);

  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAdd = () => {
    if (!newCompany || !newRole) return;
    setApps([
      ...apps,
      {
        id: Date.now().toString(),
        companyName: newCompany,
        role: newRole,
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0]
      }
    ]);
    setNewCompany('');
    setNewRole('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offered': return 'bg-green-500 hover:bg-green-600';
      case 'interviewing': return 'bg-blue-500 hover:bg-blue-600';
      case 'applied': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'rejected': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Application</CardTitle>
          <CardDescription>Track new internship applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Input placeholder="Company Name" value={newCompany} onChange={e => setNewCompany(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1">
              <Input placeholder="Role" value={newRole} onChange={e => setNewRole(e.target.value)} />
            </div>
            <Button onClick={handleAdd}>Add Tracker</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          {apps.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Application Success Rate (Interviewing/Offered)</span>
                <span>
                  {Math.round((apps.filter(a => a.status === 'interviewing' || a.status === 'offered').length / apps.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(apps.filter(a => a.status === 'interviewing' || a.status === 'offered').length / apps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.companyName}</TableCell>
                  <TableCell>{app.role}</TableCell>
                  <TableCell>{app.appliedDate || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {apps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No applications tracked yet. Add one above!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
