import React from 'react';
import { ProductReporting } from '../../reporting/ProductReporting';
import { WheelAnalytics } from './WheelAnalytics';
import { WheelEmailList } from './WheelEmailList';
import type { Segment } from './types';

interface WheelReportingWrapperProps {
  wheelId: string;
  segments: Segment[];
}

export const WheelReportingWrapper: React.FC<WheelReportingWrapperProps> = ({ 
  wheelId, 
  segments 
}) => {
  const prizeDistribution = segments.map(segment => ({
    id: segment.id,
    label: segment.label,
    value: segment.weight || 10,
    color: segment.color
  }));

  const AnalyticsWithSegments = React.useCallback(
    (props: any) => (
      <WheelAnalytics {...props} segments={segments} wheelId={wheelId} />
    ),
    [segments, wheelId]
  );

  const EmailListWithId = React.useCallback(
    () => <WheelEmailList wheelId={wheelId} />,
    [wheelId]
  );

  return (
    <ProductReporting
      productId={wheelId}
      productType="wheel"
      analyticsComponent={AnalyticsWithSegments}
      emailListComponent={EmailListWithId}
      prizeDistribution={prizeDistribution}
    />
  );
};