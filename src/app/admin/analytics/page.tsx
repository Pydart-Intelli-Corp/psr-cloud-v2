'use client';

import React from 'react';
import AnalyticsComponent from '@/components/analytics/AnalyticsComponent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AnalyticsPage() {
  return <AnalyticsComponent />;
}
