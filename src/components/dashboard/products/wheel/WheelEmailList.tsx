import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Inbox, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface EmailEntry {
  id: string;
  email: string;
  prize: string;
  created_at: string;
  marketing_consent: boolean;
}

interface WheelEmailListProps {
  wheelId: string;
}

export const WheelEmailList: React.FC<WheelEmailListProps> = ({ wheelId }) => {
  // Fetch email captures from Supabase
  const { data: emails, isLoading } = useQuery<EmailEntry[]>({
    queryKey: ['email-captures', wheelId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('email_captures')
          .select('*')
          .eq('wheel_id', wheelId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('Failed to fetch email captures:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.warn('Error fetching email captures:', error);
        return [];
      }
    },
    enabled: !!wheelId
  });

  const emailList = emails || [];
  const totalEmails = emailList.length;
  const validEmailRate = totalEmails > 0 
    ? Math.round((emailList.filter(e => e.marketing_consent).length / totalEmails) * 100)
    : 0;
  // Calculate time ago
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  };

  // Export emails to CSV
  const exportToCSV = () => {
    if (!emailList || emailList.length === 0) return;

    const csvHeaders = ['Email', 'Premio', 'Fecha', 'Consentimiento de Marketing'];
    const csvData = emailList.map(entry => [
      entry.email,
      entry.prize || 'N/A',
      new Date(entry.created_at).toLocaleString('es-ES'),
      entry.marketing_consent ? 'Sí' : 'No'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `emails_capturados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Emails Capturados</h3>
            <p className="text-sm text-gray-500 mt-1">Emails recolectados de los giros de la ruleta</p>
          </div>
          {totalEmails > 0 && (
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all border border-purple-200/50"
            >
              <Download className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Exportar CSV</span>
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : emailList.length > 0 ? (
          <>
            <div className="space-y-2">
              {emailList.slice(0, 10).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50/50 transition-colors border-b border-gray-100/50 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900">{entry.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {entry.prize && (
                        <>
                          <span className="text-sm text-gray-600">Ganó: {entry.prize}</span>
                          <span className="text-sm text-gray-400">•</span>
                        </>
                      )}
                      <span className="text-sm text-gray-400">{getTimeAgo(entry.created_at)}</span>
                      {entry.marketing_consent && (
                        <>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Consentimiento de marketing</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {emailList.length > 10 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  Mostrando 10 de {emailList.length} emails
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún No Hay Emails Capturados</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Las direcciones de email aparecerán aquí cuando los visitantes giren tu ruleta y proporcionen su información de contacto.
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Total de Emails</h4>
              <p className="text-3xl font-bold text-gray-900">{totalEmails}</p>
              {totalEmails === 0 && (
                <p className="text-sm text-gray-400 mt-2">Sin datos aún</p>
              )}
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tasa de Consentimiento</h4>
              <p className="text-3xl font-bold text-gray-900">{validEmailRate}%</p>
              <p className="text-sm text-gray-400 mt-2">
                {totalEmails > 0 ? 'Consentimiento de marketing' : 'Sin datos aún'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};