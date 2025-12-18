'use client';

import React, { Suspense } from 'react';
import AnalyticsComponent from '@/components/analytics/AnalyticsComponent';
import { FlowerSpinner } from '@/components';

export const dynamic = 'force-dynamic';

function AnalyticsContent() {
  return <AnalyticsComponent />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <FlowerSpinner size={64} />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
