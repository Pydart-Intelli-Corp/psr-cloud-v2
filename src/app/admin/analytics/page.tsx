'use client';

import React, { Suspense } from 'react';
import AnalyticsComponent from '@/components/analytics/AnalyticsComponent';
import { FlowerSpinner, PageLoader } from '@/components';

export const dynamic = 'force-dynamic';

function AnalyticsContent() {
  return <AnalyticsComponent />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnalyticsContent />
    </Suspense>
  );
}
