import { useEffect, useState } from 'react';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

export function CouponDebugPanel() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[CouponsService]') || message.includes('[InlineCouponSelector]')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: (message.includes('✅') ? 'success' : 'info') as DebugLog['level'],
          message,
          data: args.length > 1 ? args[1] : undefined
        }].slice(-50)); // Keep last 50 logs
      }
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[CouponsService]') || message.includes('[InlineCouponSelector]')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'error' as DebugLog['level'],
          message,
          data: args.length > 1 ? args[1] : undefined
        }].slice(-50));
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[CouponsService]') || message.includes('[InlineCouponSelector]')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'warn' as DebugLog['level'],
          message,
          data: args.length > 1 ? args[1] : undefined
        }].slice(-50));
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const getLevelColor = (level: DebugLog['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all ${
        isExpanded ? 'w-[600px]' : 'w-auto'
      }`}>
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              🐛 Coupon Debug Panel
            </span>
            {logs.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {logs.length} logs
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded && (
              <button
                onClick={clearLogs}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No coupon-related logs yet. Try creating a coupon!
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs font-mono break-all ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">{log.message}</div>
                      {log.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            View data
                          </summary>
                          <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}