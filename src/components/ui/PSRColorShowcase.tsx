'use client';

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  User,
  Building2,
  Milk,
  Users,
  Shield
} from 'lucide-react';

/**
 * PSR Global Color Showcase Component
 * Demonstrates the complete color system implementation
 */
export default function PSRColorShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PSR Global Color System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on the login screen green/emerald/teal palette, now implemented across the entire application
          </p>
        </div>

        {/* Primary Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Primary Buttons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="psr-btn-primary">
              Primary Action
            </button>
            <button className="psr-btn-secondary">
              Secondary Action
            </button>
            <button className="psr-btn-outline">
              Outline Button
            </button>
          </div>
        </section>

        {/* Role-Based Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Role-Based UI Elements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Super Admin */}
            <div className="psr-card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Super Admin</h3>
                  <p className="text-sm text-gray-600">Full system access</p>
                </div>
              </div>
              <div className="psr-sidebar-active rounded-lg p-3 text-center">
                Active Navigation State
              </div>
            </div>

            {/* Admin */}
            <div className="psr-card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Admin</h3>
                  <p className="text-sm text-gray-600">Management access</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-3 text-center">
                Admin Interface
              </div>
            </div>

            {/* Dairy Operations */}
            <div className="psr-card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl">
                  <Milk className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Dairy Operations</h3>
                  <p className="text-sm text-gray-600">Production management</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg p-3 text-center">
                Dairy Dashboard
              </div>
            </div>

          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Form Elements</h2>
          <div className="psr-card p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Input Field
                </label>
                <input 
                  type="text" 
                  placeholder="Enter your text here..." 
                  className="psr-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Field
                </label>
                <input 
                  type="email" 
                  placeholder="user@example.com" 
                  className="psr-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Status Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Status Indicators</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="psr-badge-success">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="psr-badge-warning">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="psr-badge-error">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="psr-badge-info">Information</span>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="psr-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,234</div>
              <div className="text-sm text-gray-600">Dairy Farms</div>
            </div>

            <div className="psr-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Milk className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">567</div>
              <div className="text-sm text-gray-600">BMCs</div>
            </div>

            <div className="psr-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">890</div>
              <div className="text-sm text-gray-600">Societies</div>
            </div>

            <div className="psr-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">45,678</div>
              <div className="text-sm text-gray-600">Farmers</div>
            </div>

          </div>
        </section>

        {/* Links and Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Links & Navigation</h2>
          <div className="psr-card p-6">
            <div className="space-y-4">
              <p>
                Visit our <a href="#" className="psr-link">documentation</a> for more information.
              </p>
              <p>
                Check out the <a href="#" className="psr-link">user guide</a> to get started.
              </p>
              <p>
                Need help? Contact <a href="#" className="psr-link">support team</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Background Gradients */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Background Gradients</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="psr-gradient-bg rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Primary Gradient Background</h3>
              <p className="text-green-100">
                Perfect for hero sections and important call-to-action areas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Light Gradient Background</h3>
              <p className="text-green-700">
                Subtle background for content areas and form containers.
              </p>
            </div>

          </div>
        </section>

        {/* Color Palette Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Palette Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            
            {/* Green Shades */}
            {[
              { name: 'Green 50', class: 'bg-green-50', text: 'text-green-900' },
              { name: 'Green 500', class: 'bg-green-500', text: 'text-white' },
              { name: 'Green 600', class: 'bg-green-600', text: 'text-white' },
              { name: 'Green 700', class: 'bg-green-700', text: 'text-white' },
              { name: 'Green 800', class: 'bg-green-800', text: 'text-white' },
              { name: 'Green 900', class: 'bg-green-900', text: 'text-white' },
            ].map((color) => (
              <div key={color.name} className={`${color.class} ${color.text} p-4 rounded-lg text-center text-sm font-medium`}>
                {color.name}
              </div>
            ))}

            {/* Emerald Shades */}
            {[
              { name: 'Emerald 50', class: 'bg-emerald-50', text: 'text-emerald-900' },
              { name: 'Emerald 500', class: 'bg-emerald-500', text: 'text-white' },
              { name: 'Emerald 600', class: 'bg-emerald-600', text: 'text-white' },
              { name: 'Emerald 700', class: 'bg-emerald-700', text: 'text-white' },
              { name: 'Emerald 800', class: 'bg-emerald-800', text: 'text-white' },
              { name: 'Emerald 900', class: 'bg-emerald-900', text: 'text-white' },
            ].map((color) => (
              <div key={color.name} className={`${color.class} ${color.text} p-4 rounded-lg text-center text-sm font-medium`}>
                {color.name}
              </div>
            ))}

            {/* Teal Shades */}
            {[
              { name: 'Teal 50', class: 'bg-teal-50', text: 'text-teal-900' },
              { name: 'Teal 500', class: 'bg-teal-500', text: 'text-white' },
              { name: 'Teal 600', class: 'bg-teal-600', text: 'text-white' },
              { name: 'Teal 700', class: 'bg-teal-700', text: 'text-white' },
              { name: 'Teal 800', class: 'bg-teal-800', text: 'text-white' },
              { name: 'Teal 900', class: 'bg-teal-900', text: 'text-white' },
            ].map((color) => (
              <div key={color.name} className={`${color.class} ${color.text} p-4 rounded-lg text-center text-sm font-medium`}>
                {color.name}
              </div>
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}