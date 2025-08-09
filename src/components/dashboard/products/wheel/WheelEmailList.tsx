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
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
            <h3 className="text-lg font-semibold text-gray-900">Email Captures</h3>
            <p className="text-sm text-gray-500 mt-1">Emails collected from wheel spins</p>
          </div>
          {totalEmails > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <Download className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Export</span>
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
                          <span className="text-sm text-gray-600">Won: {entry.prize}</span>
                          <span className="text-sm text-gray-400">•</span>
                        </>
                      )}
                      <span className="text-sm text-gray-400">{getTimeAgo(entry.created_at)}</span>
                      {entry.marketing_consent && (
                        <>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Marketing consent</span>
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
                  Showing 10 of {emailList.length} emails
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Emails Captured Yet</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Email addresses will appear here when visitors spin your wheel and provide their contact information.
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
              <h4 className="text-sm font-medium text-gray-500 mb-2">Total Emails</h4>
              <p className="text-3xl font-bold text-gray-900">{totalEmails}</p>
              {totalEmails === 0 && (
                <p className="text-sm text-gray-400 mt-2">No data yet</p>
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
              <h4 className="text-sm font-medium text-gray-500 mb-2">Consent Rate</h4>
              <p className="text-3xl font-bold text-gray-900">{validEmailRate}%</p>
              <p className="text-sm text-gray-400 mt-2">
                {totalEmails > 0 ? 'Marketing consent' : 'No data yet'}
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