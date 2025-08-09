import React, { useState } from 'react';
import { ScheduleConfigurator } from '../../components/scheduling/ScheduleConfigurator';
import { SchedulePreview } from '../../components/scheduling/SchedulePreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Save, Calendar } from 'lucide-react';
import type { WheelScheduleConfig } from '../../types/models';
import { defaultScheduleConfig, formatScheduleSummary, isWheelActiveNow } from '../../utils/scheduleHelpers';

export const WheelSchedulingDemo: React.FC = () => {
  const [scheduleConfig, setScheduleConfig] = useState<WheelScheduleConfig>(defaultScheduleConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In real app, this would save to database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isActive = isWheelActiveNow(scheduleConfig);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Wheel Scheduling
          </h1>
          <p className="text-gray-600 mt-1">
            Configure when your spin wheel should be active
          </p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Schedule'}
        </Button>
      </div>

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  !scheduleConfig.enabled ? 'bg-gray-400' :
                  isActive ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`} />
                <span className="font-medium">
                  {!scheduleConfig.enabled ? 'No Schedule (Always Active)' :
                   isActive ? 'Wheel is Active' : 'Wheel is Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatScheduleSummary(scheduleConfig)}
              </p>
            </div>
            {scheduleConfig.enabled && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium">{scheduleConfig.timezone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configurator */}
        <div className="lg:col-span-2">
          <ScheduleConfigurator
            config={scheduleConfig}
            onChange={setScheduleConfig}
            timezone="America/New_York"
          />
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <SchedulePreview
            config={scheduleConfig}
            timezone="America/New_York"
          />
        </div>
      </div>

      {/* Example Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Example Use Cases</CardTitle>
          <CardDescription>
            Common scheduling scenarios for your spin wheel
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">🎄 Holiday Campaign</h4>
            <p className="text-sm text-gray-600">
              Run from Dec 1-25, exclude Dec 24-25 for shipping
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">🍔 Restaurant Happy Hour</h4>
            <p className="text-sm text-gray-600">
              Daily 4-7 PM for dinner rush promotions
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">💼 B2B Business Hours</h4>
            <p className="text-sm text-gray-600">
              Mon-Fri 9-5 when decision makers are active
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">🌙 Night Owl Special</h4>
            <p className="text-sm text-gray-600">
              10 PM - 2 AM for late-night shoppers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};