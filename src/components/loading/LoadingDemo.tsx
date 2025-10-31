'use client';

import React, { useState } from 'react';
import {
  LoadingSpinner,
  LoadingOverlay,
  PageLoading,
  LoadingButton,
  FlowerSpinner,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  useLoading
} from '@/components';

export default function LoadingDemo() {
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPageLoading, setShowPageLoading] = useState(false);
  const { showPageLoading: globalPageLoading, hidePageLoading } = useLoading();

  const handleOverlayTest = () => {
    setOverlayLoading(true);
    setTimeout(() => setOverlayLoading(false), 3000);
  };

  const handleButtonTest = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handlePageLoadingTest = () => {
    setShowPageLoading(true);
    setTimeout(() => setShowPageLoading(false), 3000);
  };

  const handleGlobalLoadingTest = () => {
    globalPageLoading('Testing global loading...');
    setTimeout(() => hidePageLoading(), 3000);
  };

  if (showPageLoading) {
    return <PageLoading text="Testing page loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Loading Components Demo</h1>

        {/* Flower Spinners */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">🌸 Flower Loading Spinners</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="mb-4 font-medium">Size 16</p>
              <FlowerSpinner size={16} />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Size 24</p>
              <FlowerSpinner size={24} />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Size 32</p>
              <FlowerSpinner size={32} />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Size 48</p>
              <FlowerSpinner size={48} />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Size 64</p>
              <FlowerSpinner size={64} />
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-3">On Dark Backgrounds</h3>
            <div className="flex justify-center space-x-8">
              <FlowerSpinner size={32} className="brightness-150" />
              <FlowerSpinner size={48} className="brightness-200" />
            </div>
          </div>
        </section>

        {/* Basic Spinners */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">LoadingSpinner Component (with Text)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="mb-4 font-medium">Small</p>
              <LoadingSpinner size="small" />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Medium</p>
              <LoadingSpinner size="medium" />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">Large</p>
              <LoadingSpinner size="large" />
            </div>
            <div className="text-center">
              <p className="mb-4 font-medium">XL</p>
              <LoadingSpinner size="xl" />
            </div>
          </div>
        </section>

        {/* Loading Overlay Demo */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Loading Overlay</h2>
          <button
            onClick={handleOverlayTest}
            className="mb-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25"
          >
            Test Overlay Loading
          </button>
          
          <LoadingOverlay isLoading={overlayLoading} text="Processing data...">
            <div className="h-48 bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Sample Content</h3>
              <p>This content will be overlaid with loading spinner when the button is clicked.</p>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </LoadingOverlay>
        </section>

        {/* Loading Buttons */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Loading Buttons</h2>
          <div className="space-x-4">
            <LoadingButton
              isLoading={buttonLoading}
              onClick={handleButtonTest}
              variant="primary"
              loadingText="Submitting..."
            >
              Primary Button
            </LoadingButton>
            
            <LoadingButton
              isLoading={buttonLoading}
              onClick={handleButtonTest}
              variant="secondary"
              loadingText="Processing..."
            >
              Secondary Button
            </LoadingButton>
            
            <LoadingButton
              isLoading={buttonLoading}
              onClick={handleButtonTest}
              variant="outline"
              size="large"
              loadingText="Loading..."
            >
              Large Outline Button
            </LoadingButton>
          </div>
        </section>

        {/* Page Loading Tests */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Page Loading</h2>
          <div className="space-x-4">
            <button
              onClick={handlePageLoadingTest}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg hover:from-teal-700 hover:to-green-700 shadow-lg shadow-teal-500/25"
            >
              Test Page Loading
            </button>
            <button
              onClick={handleGlobalLoadingTest}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Global Loading
            </button>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Skeleton Loaders</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Basic Skeletons</h3>
              <div className="space-y-3">
                <Skeleton variant="text" />
                <Skeleton variant="text" lines={3} />
                <Skeleton variant="rectangular" height={100} />
                <Skeleton variant="circular" width={50} height={50} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Card Skeleton</h3>
              <CardSkeleton />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Table Skeleton</h3>
            <TableSkeleton rows={4} columns={5} />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">List Skeleton</h3>
            <ListSkeleton items={4} />
          </div>
        </section>

        {/* Usage Code Examples */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Usage Examples</h2>
          <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
{`// Import components
import { LoadingSpinner, LoadingButton, useLoading } from '@/components';

// Basic usage
<LoadingSpinner size="large" text="Loading data..." />

// Button with loading state
<LoadingButton isLoading={loading} onClick={handleSubmit}>
  Submit
</LoadingButton>

// Global loading state
const { showPageLoading, hidePageLoading } = useLoading();`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}