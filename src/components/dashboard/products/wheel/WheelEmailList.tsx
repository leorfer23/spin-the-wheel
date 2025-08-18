import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Inbox, Download, Search, Trophy, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

interface WheelEmailListProps {
  wheelId: string;
}

export const WheelEmailList: React.FC<WheelEmailListProps> = ({ wheelId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch email captures using analytics service
  const { data: emails, isLoading } = useQuery({
    queryKey: ['email-captures', wheelId],
    queryFn: async () => {
      return await analyticsService.getEmailCaptures(wheelId);
    },
    enabled: !!wheelId
  });

  const emailList = emails || [];
  
  // Filter emails based on search term
  const filteredEmails = emailList.filter(email => 
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalEmails = emailList.length;
  const validEmailRate = totalEmails > 0 
    ? Math.round((emailList.filter(e => e.marketingConsent).length / totalEmails) * 100)
    : 0;
  const totalPrizesWon = emailList.reduce((sum, e) => sum + e.prizesWon.length, 0);
  
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
    analyticsService.exportEmailsToCSV(emailList);
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
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmails}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Con Consentimiento</p>
                <p className="text-2xl font-bold text-purple-900">{validEmailRate}%</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-sm text-pink-600">Premios Ganados</p>
                <p className="text-2xl font-bold text-pink-900">{totalPrizesWon}</p>
              </div>
            </div>

            {/* Email List */}
            <div className="space-y-2">
              {filteredEmails.slice(0, 10).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gray-50/50 transition-colors border-b border-gray-100/50 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900">{entry.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {entry.prizesWon.length > 0 && (
                            <>
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {entry.prizesWon[0]}
                                {entry.prizesWon.length > 1 && ` +${entry.prizesWon.length - 1}`}
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                            </>
                          )}
                          <span className="text-sm text-gray-400">{getTimeAgo(entry.capturedAt)}</span>
                          {entry.totalSpins > 0 && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{entry.totalSpins} giros</span>
                            </>
                          )}
                          {entry.marketingConsent && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Marketing OK</span>
                            </>
                          )}
                        </div>
                      </div>
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