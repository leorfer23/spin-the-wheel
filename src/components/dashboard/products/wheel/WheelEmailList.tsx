import React from 'react';

interface EmailEntry {
  email: string;
  prize: string;
  time: string;
}

const mockEmails: EmailEntry[] = [
  { email: 'john.doe@example.com', prize: '20% OFF', time: '2 min' },
  { email: 'jane.smith@example.com', prize: 'FREE SHIPPING', time: '5 min' },
  { email: 'mike.wilson@example.com', prize: '10% OFF', time: '12 min' },
  { email: 'sarah.johnson@example.com', prize: 'BONUS GIFT', time: '1 hr' },
  { email: 'david.brown@example.com', prize: 'TRY AGAIN', time: '2 hr' },
  { email: 'emma.davis@example.com', prize: '20% OFF', time: '3 hr' },
  { email: 'james.miller@example.com', prize: 'FREE SHIPPING', time: '5 hr' },
];

interface WheelEmailListProps {
  wheelId: string;
}

export const WheelEmailList: React.FC<WheelEmailListProps> = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Email Captures</h3>
            <p className="text-sm text-gray-500 mt-1">Emails collected from wheel spins</p>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 7 days</span>
        </div>
        <div className="space-y-4">
          {mockEmails.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">{entry.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">Won: {entry.prize}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{entry.time} ago</span>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="w-full py-3 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
            View All Email Captures →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Total Emails</h4>
          <p className="text-3xl font-semibold text-gray-900">2,456</p>
          <p className="text-sm text-green-600 mt-2">↑ 18% from last month</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Email Quality</h4>
          <p className="text-3xl font-semibold text-gray-900">94%</p>
          <p className="text-sm text-gray-500 mt-2">Valid email rate</p>
        </div>
      </div>
    </div>
  );
};