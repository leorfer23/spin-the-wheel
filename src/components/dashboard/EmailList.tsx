import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Download, 
  Mail, 
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface EmailEntry {
  id: string;
  email: string;
  capturedAt: string;
  marketingConsent: boolean;
  prizesWon: string[];
  totalSpins: number;
}

interface EmailListProps {
  emails: EmailEntry[];
  onExport: () => void;
  loading?: boolean;
}

/**
 * EmailList displays captured emails with search, filter, and export functionality
 */
export const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  onExport,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConsent, setFilterConsent] = useState<boolean | null>(null);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConsent = filterConsent === null || email.marketingConsent === filterConsent;
    return matchesSearch && matchesConsent;
  });

  const exportToCSV = () => {
    const headers = ['Email', 'Captured Date', 'Marketing Consent', 'Total Spins', 'Prizes Won'];
    const csvData = filteredEmails.map(email => [
      email.email,
      format(new Date(email.capturedAt), 'yyyy-MM-dd HH:mm:ss'),
      email.marketingConsent ? 'Yes' : 'No',
      email.totalSpins,
      email.prizesWon.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `email_list_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onExport();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Captured Emails</CardTitle>
            <CardDescription>
              Manage and export your email list
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} disabled={loading || filteredEmails.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredEmails.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterConsent === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterConsent(null)}
              >
                All
              </Button>
              <Button
                variant={filterConsent === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterConsent(true)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Consented
              </Button>
              <Button
                variant={filterConsent === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterConsent(false)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                No Consent
              </Button>
            </div>
          </div>

          {/* Email Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-medium">Email</th>
                  <th className="text-left p-3 text-sm font-medium">Captured</th>
                  <th className="text-center p-3 text-sm font-medium">Consent</th>
                  <th className="text-center p-3 text-sm font-medium">Spins</th>
                  <th className="text-left p-3 text-sm font-medium">Prizes Won</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      Loading emails...
                    </td>
                  </tr>
                ) : filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      No emails found
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{email.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {format(new Date(email.capturedAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="p-3 text-center">
                        {email.marketingConsent ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {email.totalSpins}
                      </td>
                      <td className="p-3">
                        {email.prizesWon.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {email.prizesWon.map((prize, index) => (
                              <span 
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {prize}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No prizes</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {filteredEmails.length} of {emails.length} emails
            </div>
            <div className="flex gap-4">
              <span>
                With consent: {emails.filter(e => e.marketingConsent).length}
              </span>
              <span>
                Total spins: {emails.reduce((sum, e) => sum + e.totalSpins, 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};