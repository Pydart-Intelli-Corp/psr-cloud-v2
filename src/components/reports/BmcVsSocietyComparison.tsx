'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  totalRecords: number;
  totalQuantity: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
  totalAmount: number;
  averageRate: number;
}

interface BmcVsSocietyComparisonProps {
  dateRange: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
  timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export default function BmcVsSocietyComparison({ 
  dateRange,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange,
  reportSource = 'bmc',
  timePeriod = 'daily'
}: BmcVsSocietyComparisonProps) {
  const [bmcData, setBmcData] = useState<ComparisonData | null>(null);
  const [societyData, setSocietyData] = useState<ComparisonData | null>(null);
  const [dailyBmcData, setDailyBmcData] = useState<Array<{ date: string; data: ComparisonData }>>([]);
  const [dailySocietyData, setDailySocietyData] = useState<Array<{ date: string; data: ComparisonData }>>([]);
  const [lastWeekBmcData, setLastWeekBmcData] = useState<ComparisonData | null>(null);
  const [lastWeekSocietyData, setLastWeekSocietyData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string }>>([]);
  const [filteredSocieties, setFilteredSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(['BMC Qty', 'Society Qty']));

  const toggleMetric = (metric: string) => {
    setActiveMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metric)) {
        newSet.delete(metric);
      } else {
        newSet.add(metric);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (bmcFilter.length > 0 && societies.length > 0) {
      const selectedBmcId = parseInt(bmcFilter[0]);
      const filtered = societies.filter(s => s.bmc_id === selectedBmcId);
      setFilteredSocieties(filtered);
    } else {
      setFilteredSocieties([]);
    }
  }, [bmcFilter, societies]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const [bmcsRes, societiesRes] = await Promise.all([
        fetch('/api/user/bmc', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/society', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (bmcsRes.ok) {
        const data = await bmcsRes.json();
        setBmcs(data.data || []);
      }

      if (societiesRes.ok) {
        const data = await societiesRes.json();
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const dependencyKey = `${dateRange.from}-${dateRange.to}-${bmcFilter.join(',')}-${societyFilter.join(',')}-${societies.length}`;

  useEffect(() => {
    if (bmcFilter.length > 0 && societyFilter.length > 0 && societies.length > 0) {
      fetchComparisonData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // If label is 'Today', use only today's date
      const today = new Date().toISOString().split('T')[0];
      const effectiveFrom = dateRange.label === 'Today' ? today : dateRange.from;
      const effectiveTo = dateRange.label === 'Today' ? today : dateRange.to;
      
      console.log('BmcVsSociety - Date filtering:', { label: dateRange.label, effectiveFrom, effectiveTo, today });
      
      // Fetch collection data for BMC - use BMC endpoint if reportSource is 'bmc'
      const collectionEndpoint = reportSource === 'bmc' 
        ? '/api/user/reports/bmc-collections'
        : '/api/user/reports/collections';
      
      console.log('BmcVsSociety - Fetching from:', collectionEndpoint, 'reportSource:', reportSource);
      
      const collectionResponse = await fetch(collectionEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!collectionResponse.ok) {
        console.error('BmcVsSociety - Collection fetch failed:', collectionResponse.status);
        setLoading(false);
        return;
      }

      const allCollectionRecords = await collectionResponse.json() || [];
      console.log('BmcVsSociety - Total collection records:', allCollectionRecords.length);
      if (allCollectionRecords.length > 0) {
        console.log('BmcVsSociety - Sample collection record:', allCollectionRecords[0]);
      }
      
      const selectedBmcId = parseInt(bmcFilter[0]);
      console.log('BmcVsSociety - Selected BMC ID:', selectedBmcId);
      
      const selectedSociety = societies.find(s => s.id.toString() === societyFilter[0]);
      const selectedSocietyId = selectedSociety?.society_id;
      console.log('BmcVsSociety - Selected Society ID:', selectedSocietyId);

      // BMC level collection data (all societies under this BMC)
      const bmcRecords = allCollectionRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
        const matchesDate = dateRange.label === 'Today' 
          ? recordDate === effectiveFrom 
          : (recordDate >= effectiveFrom && recordDate <= effectiveTo);
        
        // For BMC reports, the bmc_id might be in the record directly or we need to match all records
        const matchesBmc = reportSource === 'bmc' 
          ? true  // BMC endpoint already filters by BMC, so accept all records
          : r.bmc_id === selectedBmcId;
        
        if (matchesDate) {
          console.log('BmcVsSociety - Record check:', { 
            recordDate, 
            matchesDate, 
            bmc_id: r.bmc_id, 
            selectedBmcId,
            reportSource,
            matchesBmc
          });
        }
        
        return matchesDate && matchesBmc;
      });
      console.log('BmcVsSociety - Filtered BMC records:', bmcRecords.length);
      setBmcData(calculateStats(bmcRecords));

      // Calculate last period data for comparison
      if (timePeriod === 'weekly' || timePeriod === 'monthly' || timePeriod === 'yearly') {
        let lastPeriodStart: Date, lastPeriodEnd: Date;
        
        if (timePeriod === 'weekly') {
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setDate(lastPeriodStart.getDate() - 7);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 7);
        } else if (timePeriod === 'monthly') {
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setMonth(lastPeriodStart.getMonth() - 1);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setMonth(lastPeriodEnd.getMonth() - 1);
        } else { // yearly
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setFullYear(lastPeriodStart.getFullYear() - 1);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setFullYear(lastPeriodEnd.getFullYear() - 1);
        }
        
        const lastPeriodBmcRecords = allCollectionRecords.filter((r: any) => {
          const recordDate = r.collection_date || r.date;
          const matchesDate = recordDate >= lastPeriodStart.toISOString().split('T')[0] && 
                             recordDate <= lastPeriodEnd.toISOString().split('T')[0];
          const matchesBmc = reportSource === 'bmc' ? true : r.bmc_id === selectedBmcId;
          return matchesDate && matchesBmc;
        });
        setLastWeekBmcData(calculateStats(lastPeriodBmcRecords));
      } else if (timePeriod !== 'daily') {
        setLastWeekBmcData(null);
      }

      // Calculate breakdown for BMC based on time period
      if (timePeriod === 'daily') {
        // Check if date range is selected (from !== to)
        if (effectiveFrom !== effectiveTo) {
          // Day-by-day breakdown for date range
          const dailyBmcBreakdown: Array<{ date: string; data: ComparisonData }> = [];
          const startDate = new Date(effectiveFrom);
          const endDate = new Date(effectiveTo);
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            const dayBmcRecords = allCollectionRecords.filter((r: any) => {
              const recordDate = r.collection_date || r.date;
              const matchesDate = recordDate === dateStr;
              const matchesBmc = reportSource === 'bmc' ? true : r.bmc_id === selectedBmcId;
              return matchesDate && matchesBmc;
            });
            
            dailyBmcBreakdown.push({
              date: dateStr,
              data: calculateStats(dayBmcRecords)
            });
          }
          setDailyBmcData(dailyBmcBreakdown);
          setLastWeekBmcData(null);
        } else {
          // Single day - calculate yesterday's data for comparison
          const yesterday = new Date(effectiveFrom);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          // Get yesterday's BMC records
          const yesterdayBmcRecords = allCollectionRecords.filter((r: any) => {
            const recordDate = r.collection_date || r.date;
            const matchesDate = recordDate === yesterdayStr;
            const matchesBmc = reportSource === 'bmc' ? true : r.bmc_id === selectedBmcId;
            return matchesDate && matchesBmc;
          });
          setLastWeekBmcData(calculateStats(yesterdayBmcRecords));
          
          // Set daily breakdown for table display
          const dailyBmcBreakdown: Array<{ date: string; data: ComparisonData }> = [
            {
              date: `Yesterday (${yesterdayStr})`,
              data: calculateStats(yesterdayBmcRecords)
            },
            {
              date: `Today (${effectiveFrom})`,
              data: calculateStats(bmcRecords)
            }
          ];
          setDailyBmcData(dailyBmcBreakdown);
        }

      } else if (timePeriod === 'weekly') {
        // Weekly breakdown - show both this week and last week
        const weeklyBmcBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(effectiveFrom);
        const endDate = new Date(effectiveTo);
        
        // Calculate last week's dates
        const lastWeekStart = new Date(startDate);
        lastWeekStart.setDate(startDate.getDate() - 7);
        const lastWeekEnd = new Date(endDate);
        lastWeekEnd.setDate(endDate.getDate() - 7);
        
        // Add last week data
        const lastWeekBmcRecords = allCollectionRecords.filter((r: any) => {
          const recordDate = r.collection_date || r.date;
          const matchesDate = recordDate >= lastWeekStart.toISOString().split('T')[0] && 
                 recordDate <= lastWeekEnd.toISOString().split('T')[0];
          const matchesBmc = reportSource === 'bmc' ? true : r.bmc_id === selectedBmcId;
          return matchesDate && matchesBmc;
        });
        
        if (lastWeekBmcRecords.length > 0) {
          weeklyBmcBreakdown.push({
            date: `Last Week (${lastWeekStart.toISOString().split('T')[0]})`,
            data: calculateStats(lastWeekBmcRecords)
          });
        }
        
        // Add this week data
        const thisWeekBmcRecords = bmcRecords;
        if (thisWeekBmcRecords.length > 0) {
          weeklyBmcBreakdown.push({
            date: `This Week (${startDate.toISOString().split('T')[0]})`,
            data: calculateStats(thisWeekBmcRecords)
          });
        }
        
        setDailyBmcData(weeklyBmcBreakdown);
      } else if (timePeriod === 'monthly') {
        // Monthly breakdown
        const monthlyBmcBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(effectiveFrom);
        const endDate = new Date(effectiveTo);
        
        let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentMonth <= endDate) {
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          const monthBmcRecords = bmcRecords.filter((r: any) => {
            const recordDate = r.collection_date || r.date;
            return recordDate >= currentMonth.toISOString().split('T')[0] && 
                   recordDate <= monthEnd.toISOString().split('T')[0];
          });
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          monthlyBmcBreakdown.push({
            date: `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
            data: calculateStats(monthBmcRecords)
          });
          
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
        setDailyBmcData(monthlyBmcBreakdown);
      } else if (timePeriod === 'yearly') {
        // Yearly breakdown
        const yearlyBmcBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startYear = new Date(effectiveFrom).getFullYear();
        const endYear = new Date(effectiveTo).getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31);
          
          const yearBmcRecords = bmcRecords.filter((r: any) => {
            const recordDate = r.collection_date || r.date;
            return recordDate >= yearStart.toISOString().split('T')[0] && 
                   recordDate <= yearEnd.toISOString().split('T')[0];
          });
          
          yearlyBmcBreakdown.push({
            date: `${year}`,
            data: calculateStats(yearBmcRecords)
          });
        }
        setDailyBmcData(yearlyBmcBreakdown);
      } else {
        setDailyBmcData([]);
      }

      // Fetch dispatch data for Society - always use society endpoint
      const dispatchResponse = await fetch('/api/user/reports/dispatches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!dispatchResponse.ok) {
        console.error('BmcVsSociety - Dispatch fetch failed:', dispatchResponse.status);
        setLoading(false);
        return;
      }

      const allDispatchRecords = await dispatchResponse.json() || [];
      console.log('BmcVsSociety - Total dispatch records:', allDispatchRecords.length);

      // Society level dispatch data - use society_id string
      const societyRecords = allDispatchRecords.filter((r: any) => {
        const recordDate = r.dispatch_date || r.date;
        const matchesDate = dateRange.label === 'Today'
          ? recordDate === effectiveFrom
          : (recordDate >= effectiveFrom && recordDate <= effectiveTo);
        const matchesSociety = r.society_id === selectedSocietyId;
        return matchesDate && matchesSociety;
      });
      console.log('BmcVsSociety - Filtered society records:', societyRecords.length);
      setSocietyData(calculateStats(societyRecords));

      // Calculate last period data for comparison
      if (timePeriod === 'weekly' || timePeriod === 'monthly' || timePeriod === 'yearly') {
        let lastPeriodStart: Date, lastPeriodEnd: Date;
        
        if (timePeriod === 'weekly') {
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setDate(lastPeriodStart.getDate() - 7);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 7);
        } else if (timePeriod === 'monthly') {
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setMonth(lastPeriodStart.getMonth() - 1);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setMonth(lastPeriodEnd.getMonth() - 1);
        } else { // yearly
          lastPeriodStart = new Date(effectiveFrom);
          lastPeriodStart.setFullYear(lastPeriodStart.getFullYear() - 1);
          lastPeriodEnd = new Date(effectiveTo);
          lastPeriodEnd.setFullYear(lastPeriodEnd.getFullYear() - 1);
        }
        
        const lastPeriodSocietyRecords = allDispatchRecords.filter((r: any) => {
          const recordDate = r.dispatch_date || r.date;
          const matchesDate = recordDate >= lastPeriodStart.toISOString().split('T')[0] && 
                             recordDate <= lastPeriodEnd.toISOString().split('T')[0];
          const matchesSociety = r.society_id === selectedSocietyId;
          return matchesDate && matchesSociety;
        });
        setLastWeekSocietyData(calculateStats(lastPeriodSocietyRecords));
      } else {
        setLastWeekSocietyData(null);
      }

      // Calculate breakdown for Society based on time period
      if (timePeriod === 'daily') {
        // Check if date range is selected (from !== to)
        if (effectiveFrom !== effectiveTo) {
          // Day-by-day breakdown for date range
          const dailySocietyBreakdown: Array<{ date: string; data: ComparisonData }> = [];
          const startDate = new Date(effectiveFrom);
          const endDate = new Date(effectiveTo);
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            const daySocietyRecords = allDispatchRecords.filter((r: any) => {
              const recordDate = r.dispatch_date || r.date;
              const matchesDate = recordDate === dateStr;
              const matchesSociety = r.society_id === selectedSocietyId;
              return matchesDate && matchesSociety;
            });
            
            dailySocietyBreakdown.push({
              date: dateStr,
              data: calculateStats(daySocietyRecords)
            });
          }
          setDailySocietyData(dailySocietyBreakdown);
          setLastWeekSocietyData(null);
        } else {
          // Single day - calculate yesterday's data for comparison
          const yesterday = new Date(effectiveFrom);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          // Get yesterday's Society records
          const yesterdaySocietyRecords = allDispatchRecords.filter((r: any) => {
            const recordDate = r.dispatch_date || r.date;
            const matchesDate = recordDate === yesterdayStr;
            const matchesSociety = r.society_id === selectedSocietyId;
            return matchesDate && matchesSociety;
          });
          setLastWeekSocietyData(calculateStats(yesterdaySocietyRecords));
          
          // Set daily breakdown for table display
          const dailySocietyBreakdown: Array<{ date: string; data: ComparisonData }> = [
            {
              date: `Yesterday (${yesterdayStr})`,
              data: calculateStats(yesterdaySocietyRecords)
            },
            {
              date: `Today (${effectiveFrom})`,
              data: calculateStats(societyRecords)
            }
          ];
          setDailySocietyData(dailySocietyBreakdown);
        }
      } else if (timePeriod === 'weekly') {
        // Weekly breakdown - show both this week and last week
        const weeklySocietyBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(effectiveFrom);
        const endDate = new Date(effectiveTo);
        
        // Calculate last week's dates
        const lastWeekStart = new Date(startDate);
        lastWeekStart.setDate(startDate.getDate() - 7);
        const lastWeekEnd = new Date(endDate);
        lastWeekEnd.setDate(endDate.getDate() - 7);
        
        // Add last week data
        const lastWeekSocietyRecords = allDispatchRecords.filter((r: any) => {
          const recordDate = r.dispatch_date || r.date;
          const matchesDate = recordDate >= lastWeekStart.toISOString().split('T')[0] && 
                 recordDate <= lastWeekEnd.toISOString().split('T')[0];
          const matchesSociety = r.society_id === selectedSocietyId;
          return matchesDate && matchesSociety;
        });
        
        if (lastWeekSocietyRecords.length > 0) {
          weeklySocietyBreakdown.push({
            date: `Last Week (${lastWeekStart.toISOString().split('T')[0]})`,
            data: calculateStats(lastWeekSocietyRecords)
          });
        }
        
        // Add this week data
        const thisWeekSocietyRecords = societyRecords;
        if (thisWeekSocietyRecords.length > 0) {
          weeklySocietyBreakdown.push({
            date: `This Week (${startDate.toISOString().split('T')[0]})`,
            data: calculateStats(thisWeekSocietyRecords)
          });
        }
        
        setDailySocietyData(weeklySocietyBreakdown);
      } else if (timePeriod === 'monthly') {
        // Monthly breakdown
        const monthlySocietyBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(effectiveFrom);
        const endDate = new Date(effectiveTo);
        
        let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentMonth <= endDate) {
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          const monthSocietyRecords = societyRecords.filter((r: any) => {
            const recordDate = r.dispatch_date || r.date;
            return recordDate >= currentMonth.toISOString().split('T')[0] && 
                   recordDate <= monthEnd.toISOString().split('T')[0];
          });
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          monthlySocietyBreakdown.push({
            date: `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`,
            data: calculateStats(monthSocietyRecords)
          });
          
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
        setDailySocietyData(monthlySocietyBreakdown);
      } else if (timePeriod === 'yearly') {
        // Yearly breakdown
        const yearlySocietyBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startYear = new Date(effectiveFrom).getFullYear();
        const endYear = new Date(effectiveTo).getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31);
          
          const yearSocietyRecords = societyRecords.filter((r: any) => {
            const recordDate = r.dispatch_date || r.date;
            return recordDate >= yearStart.toISOString().split('T')[0] && 
                   recordDate <= yearEnd.toISOString().split('T')[0];
          });
          
          yearlySocietyBreakdown.push({
            date: `${year}`,
            data: calculateStats(yearSocietyRecords)
          });
        }
        setDailySocietyData(yearlySocietyBreakdown);
      } else if (timePeriod !== 'daily') {
        setDailySocietyData([]);
        setLastWeekSocietyData(null);
      }

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBmc = bmcs.find(b => b.id.toString() === bmcFilter[0]);
  const selectedSociety = societies.find(s => s.id.toString() === societyFilter[0]);

  const calculateStats = (records: any[]): ComparisonData => {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        totalQuantity: 0,
        weightedFat: 0,
        weightedSnf: 0,
        weightedClr: 0,
        totalAmount: 0,
        averageRate: 0
      };
    }

    const totalQuantity = records.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    const weightedFat = records.reduce((sum, r) => sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);
    const weightedSnf = records.reduce((sum, r) => sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);
    const weightedClr = records.reduce((sum, r) => sum + ((parseFloat(r.clr_value || r.clr) || 0) * (parseFloat(r.quantity) || 0)), 0) / (totalQuantity || 1);

    return {
      totalRecords: records.length,
      totalQuantity,
      weightedFat,
      weightedSnf,
      weightedClr,
      totalAmount,
      averageRate: totalAmount / (totalQuantity || 1)
    };
  };

  const getDifference = (bmc: number, society: number) => {
    const diff = bmc - society;
    const percentChange = society !== 0 ? ((diff / society) * 100) : 0;
    return { diff, percentChange };
  };

  const renderDifferenceCell = (bmc: number, society: number, decimals: number = 2) => {
    const { diff, percentChange } = getDifference(bmc, society);
    const isZero = diff === 0;
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    const colorClass = isZero ? 'text-green-600' : isPositive ? 'text-yellow-600' : 'text-red-600';
    const iconClass = isZero ? 'text-green-600' : isPositive ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`font-bold ${colorClass}`}>
          {isPositive ? '+' : ''}{diff.toFixed(decimals)}
        </span>
        <div className="flex items-center gap-1">
          {isZero && <Minus className={`w-3 h-3 ${iconClass}`} />}
          {isPositive && <TrendingUp className={`w-3 h-3 ${iconClass}`} />}
          {isNegative && <TrendingDown className={`w-3 h-3 ${iconClass}`} />}
          <span className={`text-xs ${colorClass}`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  const exportToCSV = () => {
    if (!bmcData || !societyData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    let csvContent = [
      'POORNASREE EQUIPMENTS - BMC vs Society Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Period: ${dateRange.label} (${dateRange.from} to ${dateRange.to})`,
      `BMC: ${selectedBmc?.name || 'N/A'} (${selectedBmc?.bmcId || 'N/A'})`,
      `Society: ${selectedSociety?.name || 'N/A'} (${selectedSociety?.society_id || 'N/A'})`,
      ''
    ];

    if (dailyBmcData.length > 0 && dailySocietyData.length > 0) {
      csvContent.push('DAY-BY-DAY BREAKDOWN', '');
      csvContent.push('Date,Type,Records,Quantity (L),FAT (%),SNF (%),CLR,Amount (Rs),Rate (Rs/L)');
      dailyBmcData.forEach((day, idx) => {
        const societyDay = dailySocietyData[idx];
        csvContent.push(`${day.date},BMC,${day.data.totalRecords},${day.data.totalQuantity.toFixed(2)},${day.data.weightedFat.toFixed(2)},${day.data.weightedSnf.toFixed(2)},${day.data.weightedClr.toFixed(2)},${day.data.totalAmount.toFixed(2)},${day.data.averageRate.toFixed(2)}`);
        csvContent.push(`${day.date},Society,${societyDay.data.totalRecords},${societyDay.data.totalQuantity.toFixed(2)},${societyDay.data.weightedFat.toFixed(2)},${societyDay.data.weightedSnf.toFixed(2)},${societyDay.data.weightedClr.toFixed(2)},${societyDay.data.totalAmount.toFixed(2)},${societyDay.data.averageRate.toFixed(2)}`);
        csvContent.push(`${day.date},Difference,${(day.data.totalRecords - societyDay.data.totalRecords).toFixed(0)},${(day.data.totalQuantity - societyDay.data.totalQuantity).toFixed(2)},${(day.data.weightedFat - societyDay.data.weightedFat).toFixed(2)},${(day.data.weightedSnf - societyDay.data.weightedSnf).toFixed(2)},${(day.data.weightedClr - societyDay.data.weightedClr).toFixed(2)},${(day.data.totalAmount - societyDay.data.totalAmount).toFixed(2)},${(day.data.averageRate - societyDay.data.averageRate).toFixed(2)}`);
      });
      csvContent.push('');
    }

    csvContent = csvContent.concat([
      'SUMMARY',
      '',
      'Metric,Total Records,Total Quantity (L),Weighted FAT (%),Weighted SNF (%),Weighted CLR,Total Amount (Rs),Avg Rate (Rs/L)',
      `BMC Collection,${bmcData.totalRecords},${bmcData.totalQuantity.toFixed(2)},${bmcData.weightedFat.toFixed(2)},${bmcData.weightedSnf.toFixed(2)},${bmcData.weightedClr.toFixed(2)},${bmcData.totalAmount.toFixed(2)},${bmcData.averageRate.toFixed(2)}`,
      `Society Dispatch,${societyData.totalRecords},${societyData.totalQuantity.toFixed(2)},${societyData.weightedFat.toFixed(2)},${societyData.weightedSnf.toFixed(2)},${societyData.weightedClr.toFixed(2)},${societyData.totalAmount.toFixed(2)},${societyData.averageRate.toFixed(2)}`,
      '',
      'Thank you',
      'Poornasree Equipments',
      'Contact: marketing@poornasree.com',
      `Generated on: ${currentDateTime}`
    ]);

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmc-society-comparison-${dateRange.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!bmcData || !societyData) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BMC vs Society Comparison - LactoConnect System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${dateRange.label} (${dateRange.from} to ${dateRange.to})`, 148.5, 21, { align: 'center' });

    let startY = 28;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Filters Applied:', 14, startY);
    doc.setFont('helvetica', 'normal');
    startY += 5;
    doc.text(`BMC: ${selectedBmc?.name || 'N/A'} (${selectedBmc?.bmcId || 'N/A'})`, 14, startY);
    startY += 4;
    doc.text(`Society: ${selectedSociety?.name || 'N/A'} (${selectedSociety?.society_id || 'N/A'})`, 14, startY);
    startY += 6;

    if (dailyBmcData.length > 0 && dailySocietyData.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DAY-BY-DAY BREAKDOWN', 148.5, startY, { align: 'center' });

      const dailyRows: any[] = [];
      dailyBmcData.forEach((day, idx) => {
        const societyDay = dailySocietyData[idx];
        dailyRows.push([day.date, 'BMC', day.data.totalRecords, day.data.totalQuantity.toFixed(2), day.data.weightedFat.toFixed(2), day.data.weightedSnf.toFixed(2), day.data.weightedClr.toFixed(2), day.data.totalAmount.toFixed(2), day.data.averageRate.toFixed(2)]);
        dailyRows.push(['', 'Society', societyDay.data.totalRecords, societyDay.data.totalQuantity.toFixed(2), societyDay.data.weightedFat.toFixed(2), societyDay.data.weightedSnf.toFixed(2), societyDay.data.weightedClr.toFixed(2), societyDay.data.totalAmount.toFixed(2), societyDay.data.averageRate.toFixed(2)]);
        dailyRows.push(['', 'Difference', (day.data.totalRecords - societyDay.data.totalRecords).toFixed(0), (day.data.totalQuantity - societyDay.data.totalQuantity).toFixed(2), (day.data.weightedFat - societyDay.data.weightedFat).toFixed(2), (day.data.weightedSnf - societyDay.data.weightedSnf).toFixed(2), (day.data.weightedClr - societyDay.data.weightedClr).toFixed(2), (day.data.totalAmount - societyDay.data.totalAmount).toFixed(2), (day.data.averageRate - societyDay.data.averageRate).toFixed(2)]);
      });

      autoTable(doc, {
        startY: startY + 4,
        head: [['Date', 'Type', 'Records', 'Qty (L)', 'FAT (%)', 'SNF (%)', 'CLR', 'Amt (Rs)', 'Rate (Rs/L)']],
        body: dailyRows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
        bodyStyles: { lineWidth: 0.2, lineColor: [200, 200, 200] }
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 148.5, startY, { align: 'center' });

    autoTable(doc, {
      startY: startY + 4,
      head: [['Metric', 'Total Records', 'Total Quantity (L)', 'Weighted FAT (%)', 'Weighted SNF (%)', 'Weighted CLR', 'Total Amount (Rs)', 'Avg Rate (Rs/L)']],
      body: [
        ['BMC Collection', bmcData.totalRecords, bmcData.totalQuantity.toFixed(2), bmcData.weightedFat.toFixed(2), bmcData.weightedSnf.toFixed(2), bmcData.weightedClr.toFixed(2), bmcData.totalAmount.toFixed(2), bmcData.averageRate.toFixed(2)],
        ['Society Dispatch', societyData.totalRecords, societyData.totalQuantity.toFixed(2), societyData.weightedFat.toFixed(2), societyData.weightedSnf.toFixed(2), societyData.weightedClr.toFixed(2), societyData.totalAmount.toFixed(2), societyData.averageRate.toFixed(2)]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.3, lineColor: [200, 200, 200] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared by: POORNASREE EQUIPMENTS', 283, finalY, { align: 'right' });
    doc.text('Contact: marketing@poornasree.com', 283, finalY + 5, { align: 'right' });

    doc.save(`bmc-society-comparison-${dateRange.from}.pdf`);
  };

  if (bmcFilter.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">Please select a BMC to view comparison</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <FlowerSpinner size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              BMC vs Society Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing {selectedBmc?.name} (BMC) vs {selectedSociety?.name || 'Select Society'} for {dateRange.label}
            </p>
          </div>
          
          {/* Export Buttons */}
          {societyFilter.length > 0 && bmcData && societyData && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">BMC:</label>
            <select
              value={bmcFilter[0] || ''}
              onChange={(e) => onBmcChange && onBmcChange(e.target.value ? [e.target.value] : [])}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select BMC</option>
              {bmcs.map((bmc) => (
                <option key={bmc.id} value={bmc.id.toString()}>
                  {bmc.name} ({bmc.bmcId})
                </option>
              ))}
            </select>
          </div>

          {bmcFilter.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Society:</label>
              <select
                value={societyFilter[0] || ''}
                onChange={(e) => onSocietyChange && onSocietyChange(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Society</option>
                {filteredSocieties.map((society) => (
                  <option key={society.id} value={society.id.toString()}>
                    {society.name} ({society.society_id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {societyFilter.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Please select a society to view comparison</p>
        </div>
      ) : !bmcData || !societyData ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for comparison</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {dailyBmcData.length > 0 && dailySocietyData.length > 0 && (timePeriod === 'daily' || timePeriod === 'weekly') ? (
            // Daily/Weekly table showing current and previous period values
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/40 dark:to-cyan-900/40">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  {timePeriod === 'daily' ? 'Day' : 'Week'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Records</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Quantity (L)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">FAT (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">SNF (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">CLR</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Amount (₹)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Rate (₹/L)</th>
              </tr>
            </thead>
            <tbody>
              {dailyBmcData.map((day, index) => {
                const societyDay = dailySocietyData[index];
                if (!societyDay) return null;
                return (
                  <React.Fragment key={day.date}>
                    <tr className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <td rowSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                          <span className="font-semibold">{day.date}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-blue-700 dark:text-blue-300 border border-gray-300 dark:border-gray-600">BMC</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{day.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{day.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{day.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{day.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{day.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{day.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{day.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-300 border border-gray-300 dark:border-gray-600">Society</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyDay.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{societyDay.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{societyDay.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{societyDay.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{societyDay.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{societyDay.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{societyDay.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Difference</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalRecords, societyDay.data.totalRecords, 0)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalQuantity, societyDay.data.totalQuantity)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedFat, societyDay.data.weightedFat)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedSnf, societyDay.data.weightedSnf)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedClr, societyDay.data.weightedClr)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalAmount, societyDay.data.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.averageRate, societyDay.data.averageRate)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/50 dark:to-cyan-900/50 font-bold">
                <td colSpan={2} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Total / Average</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">B: {bmcData.totalRecords} / S: {societyData.totalRecords}</td>
                <td className="px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-200 border border-gray-300 dark:border-gray-600">B: {bmcData.totalQuantity.toFixed(2)} / S: {societyData.totalQuantity.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedFat.toFixed(2)} / S: {societyData.weightedFat.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-purple-700 dark:text-purple-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedSnf.toFixed(2)} / S: {societyData.weightedSnf.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-pink-700 dark:text-pink-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedClr.toFixed(2)} / S: {societyData.weightedClr.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-blue-700 dark:text-blue-200 border border-gray-300 dark:border-gray-600">B: ₹{bmcData.totalAmount.toFixed(2)} / S: ₹{societyData.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-cyan-700 dark:text-cyan-200 border border-gray-300 dark:border-gray-600">B: ₹{bmcData.averageRate.toFixed(2)} / S: ₹{societyData.averageRate.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          ) : dailyBmcData.length > 0 && dailySocietyData.length > 0 ? (
            // Detailed breakdown table (Daily/Weekly/Monthly/Yearly)
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/40 dark:to-cyan-900/40">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  {timePeriod === 'daily' ? 'Day' : timePeriod === 'weekly' ? 'Week' : timePeriod === 'monthly' ? 'Month' : 'Year'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Records</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Quantity (L)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">FAT (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">SNF (%)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">CLR</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Amount (₹)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Rate (₹/L)</th>
              </tr>
            </thead>
            <tbody>
              {dailyBmcData.map((day, index) => {
                const societyDay = dailySocietyData[index];
                return (
                  <React.Fragment key={day.date}>
                    <tr className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <td rowSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                          <span className="font-semibold">{day.date}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-blue-700 dark:text-blue-300 border border-gray-300 dark:border-gray-600">BMC</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{day.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{day.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{day.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{day.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{day.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{day.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{day.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-300 border border-gray-300 dark:border-gray-600">Society</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{societyDay.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{societyDay.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{societyDay.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{societyDay.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{societyDay.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{societyDay.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{societyDay.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Difference</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalRecords, societyDay.data.totalRecords, 0)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalQuantity, societyDay.data.totalQuantity)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedFat, societyDay.data.weightedFat)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedSnf, societyDay.data.weightedSnf)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedClr, societyDay.data.weightedClr)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalAmount, societyDay.data.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.averageRate, societyDay.data.averageRate)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/50 dark:to-cyan-900/50 font-bold">
                <td colSpan={2} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Total / Average</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">B: {bmcData.totalRecords} / S: {societyData.totalRecords}</td>
                <td className="px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-200 border border-gray-300 dark:border-gray-600">B: {bmcData.totalQuantity.toFixed(2)} / S: {societyData.totalQuantity.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedFat.toFixed(2)} / S: {societyData.weightedFat.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-purple-700 dark:text-purple-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedSnf.toFixed(2)} / S: {societyData.weightedSnf.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-pink-700 dark:text-pink-200 border border-gray-300 dark:border-gray-600">B: {bmcData.weightedClr.toFixed(2)} / S: {societyData.weightedClr.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-blue-700 dark:text-blue-200 border border-gray-300 dark:border-gray-600">B: ₹{bmcData.totalAmount.toFixed(2)} / S: ₹{societyData.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-cyan-700 dark:text-cyan-200 border border-gray-300 dark:border-gray-600">B: ₹{bmcData.averageRate.toFixed(2)} / S: ₹{societyData.averageRate.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          ) : (
            // Summary comparison table (when no daily data)
            <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Metric
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Total Records
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Total Quantity (L)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Weighted FAT (%)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Weighted SNF (%)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Weighted CLR
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Total Amount (₹)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Avg Rate (₹/L)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* BMC Collection Row */}
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  BMC Collection
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{bmcData.totalRecords}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{bmcData.totalQuantity.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{bmcData.weightedFat.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{bmcData.weightedSnf.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{bmcData.weightedClr.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">₹{bmcData.totalAmount.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">₹{bmcData.averageRate.toFixed(2)}</span>
                </td>
              </tr>

              {/* Society Dispatch Row */}
              <tr className="bg-green-50 dark:bg-green-900/20">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  Society Dispatch
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{societyData.totalRecords}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{societyData.totalQuantity.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{societyData.weightedFat.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{societyData.weightedSnf.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">{societyData.weightedClr.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">₹{societyData.totalAmount.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">₹{societyData.averageRate.toFixed(2)}</span>
                </td>
              </tr>

              {/* Difference Row */}
              <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                  Difference (BMC - Society)
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.totalRecords, societyData.totalRecords, 0)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.totalQuantity, societyData.totalQuantity)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.weightedFat, societyData.weightedFat)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.weightedSnf, societyData.weightedSnf)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.weightedClr, societyData.weightedClr)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.totalAmount, societyData.totalAmount)}
                </td>
                <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                  {renderDifferenceCell(bmcData.averageRate, societyData.averageRate)}
                </td>
              </tr>


            </tbody>
            </table>
          )}
        {/* Note */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> {dailyBmcData.length > 0 ? `BMC Collection shows aggregated collection data for all societies under the selected BMC. Society Dispatch shows dispatch data for the selected society only. Data is grouped by ${timePeriod === 'daily' ? 'day' : timePeriod === 'weekly' ? 'week' : timePeriod === 'monthly' ? 'month' : 'year'}. Positive differences indicate collection is higher than dispatch.` : 'This comparison shows weighted average values for BMC Collection vs Society Dispatch in the selected time period. Positive differences mean BMC values are higher, negative differences mean Society values are higher.'}
          </p>
        </div>

          {/* Distribution Chart - Radar Style - Hide when daily data is available */}
          {dailyBmcData.length === 0 && dailySocietyData.length === 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Distribution Chart — Comparison Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Radar visualization showing all parameters normalized to 0-100 scale</p>
            
            {(() => {
              const normalize = (value: number, min: number, max: number) => {
                if (max === min) return 50;
                return ((value - min) / (max - min)) * 100;
              };

              const qtyMin = Math.min(bmcData.totalQuantity, societyData.totalQuantity) * 0.9;
              const qtyMax = Math.max(bmcData.totalQuantity, societyData.totalQuantity) * 1.1;
              const amtMin = Math.min(bmcData.totalAmount, societyData.totalAmount) * 0.9;
              const amtMax = Math.max(bmcData.totalAmount, societyData.totalAmount) * 1.1;
              const fatMin = Math.min(bmcData.weightedFat, societyData.weightedFat) * 0.9;
              const fatMax = Math.max(bmcData.weightedFat, societyData.weightedFat) * 1.1;
              const snfMin = Math.min(bmcData.weightedSnf, societyData.weightedSnf) * 0.9;
              const snfMax = Math.max(bmcData.weightedSnf, societyData.weightedSnf) * 1.1;
              const clrMin = Math.min(bmcData.weightedClr, societyData.weightedClr) * 0.9;
              const clrMax = Math.max(bmcData.weightedClr, societyData.weightedClr) * 1.1;
              const rateMin = Math.min(bmcData.averageRate, societyData.averageRate) * 0.9;
              const rateMax = Math.max(bmcData.averageRate, societyData.averageRate) * 1.1;

              const bmcNormalized = [
                { parameter: 'Quantity', value: normalize(bmcData.totalQuantity, qtyMin, qtyMax), actual: bmcData.totalQuantity, unit: 'L' },
                { parameter: 'Amount', value: normalize(bmcData.totalAmount, amtMin, amtMax), actual: bmcData.totalAmount, unit: '₹' },
                { parameter: 'FAT %', value: normalize(bmcData.weightedFat, fatMin, fatMax), actual: bmcData.weightedFat, unit: '%' },
                { parameter: 'SNF %', value: normalize(bmcData.weightedSnf, snfMin, snfMax), actual: bmcData.weightedSnf, unit: '%' },
                { parameter: 'CLR', value: normalize(bmcData.weightedClr, clrMin, clrMax), actual: bmcData.weightedClr, unit: '' },
                { parameter: 'Rate', value: normalize(bmcData.averageRate, rateMin, rateMax), actual: bmcData.averageRate, unit: '₹/L' }
              ];

              const societyNormalized = [
                { parameter: 'Quantity', value: normalize(societyData.totalQuantity, qtyMin, qtyMax), actual: societyData.totalQuantity, unit: 'L' },
                { parameter: 'Amount', value: normalize(societyData.totalAmount, amtMin, amtMax), actual: societyData.totalAmount, unit: '₹' },
                { parameter: 'FAT %', value: normalize(societyData.weightedFat, fatMin, fatMax), actual: societyData.weightedFat, unit: '%' },
                { parameter: 'SNF %', value: normalize(societyData.weightedSnf, snfMin, snfMax), actual: societyData.weightedSnf, unit: '%' },
                { parameter: 'CLR', value: normalize(societyData.weightedClr, clrMin, clrMax), actual: societyData.weightedClr, unit: '' },
                { parameter: 'Rate', value: normalize(societyData.averageRate, rateMin, rateMax), actual: societyData.averageRate, unit: '₹/L' }
              ];

              const combinedData = [
                { parameter: 'Quantity', bmc: normalize(bmcData.totalQuantity, qtyMin, qtyMax), society: normalize(societyData.totalQuantity, qtyMin, qtyMax), bmcActual: bmcData.totalQuantity, societyActual: societyData.totalQuantity, unit: 'L' },
                { parameter: 'Amount', bmc: normalize(bmcData.totalAmount, amtMin, amtMax), society: normalize(societyData.totalAmount, amtMin, amtMax), bmcActual: bmcData.totalAmount, societyActual: societyData.totalAmount, unit: '₹' },
                { parameter: 'FAT %', bmc: normalize(bmcData.weightedFat, fatMin, fatMax), society: normalize(societyData.weightedFat, fatMin, fatMax), bmcActual: bmcData.weightedFat, societyActual: societyData.weightedFat, unit: '%' },
                { parameter: 'SNF %', bmc: normalize(bmcData.weightedSnf, snfMin, snfMax), society: normalize(societyData.weightedSnf, snfMin, snfMax), bmcActual: bmcData.weightedSnf, societyActual: societyData.weightedSnf, unit: '%' },
                { parameter: 'CLR', bmc: normalize(bmcData.weightedClr, clrMin, clrMax), society: normalize(societyData.weightedClr, clrMin, clrMax), bmcActual: bmcData.weightedClr, societyActual: societyData.weightedClr, unit: '' },
                { parameter: 'Rate', bmc: normalize(bmcData.averageRate, rateMin, rateMax), society: normalize(societyData.averageRate, rateMin, rateMax), bmcActual: bmcData.averageRate, societyActual: societyData.averageRate, unit: '₹/L' }
              ];

              return (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">BMC Collection</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={bmcNormalized}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar name="BMC Collection" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                              border: '1px solid rgba(75, 85, 99, 0.5)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                              color: '#fff'
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                            itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                            formatter={(value: any, name: string, props: any) => {
                              const actual = props.payload.actual;
                              const unit = props.payload.unit;
                              return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{bmcData.totalQuantity.toFixed(2)} L</span></div>
                        <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{bmcData.totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{bmcData.weightedFat.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{bmcData.weightedSnf.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{bmcData.weightedClr.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{bmcData.averageRate.toFixed(2)}/L</span></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Society Dispatch</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={societyNormalized}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar name="Society Dispatch" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} strokeWidth={2} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                              border: '1px solid rgba(75, 85, 99, 0.5)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                              color: '#fff'
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                            itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                            formatter={(value: any, name: string, props: any) => {
                              const actual = props.payload.actual;
                              const unit = props.payload.unit;
                              return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{societyData.totalQuantity.toFixed(2)} L</span></div>
                        <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{societyData.totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{societyData.weightedFat.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{societyData.weightedSnf.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{societyData.weightedClr.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{societyData.averageRate.toFixed(2)}/L</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Overlay Comparison</h4>
                    <ResponsiveContainer width="100%" height={450}>
                      <RadarChart data={combinedData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Radar name="BMC Collection" dataKey="bmc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2.5} />
                        <Radar name="Society Dispatch" dataKey="society" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2.5} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                            border: '1px solid rgba(75, 85, 99, 0.5)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            color: '#fff'
                          }}
                          labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                          itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                          formatter={(value: any, name: string, props: any) => {
                            const actual = name === 'BMC Collection' ? props.payload.bmcActual : props.payload.societyActual;
                            const unit = props.payload.unit;
                            return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
          </div>
          )}

          {/* Weekly/Monthly/Yearly Radar Chart */}
          {(timePeriod === 'weekly' || timePeriod === 'monthly' || timePeriod === 'yearly') && dailyBmcData.length > 0 && dailySocietyData.length > 0 && lastWeekBmcData && lastWeekSocietyData && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{timePeriod === 'weekly' ? 'Weekly' : timePeriod === 'monthly' ? 'Monthly' : 'Yearly'} Comparison — Radar Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{timePeriod === 'weekly' ? 'This Week vs Last Week' : timePeriod === 'monthly' ? 'This Month vs Last Month' : 'This Year vs Last Year'} normalized to 0-100 scale</p>
              
              {(() => {
                const normalize = (value: number, min: number, max: number) => {
                  if (max === min) return 50;
                  return ((value - min) / (max - min)) * 100;
                };

                // Get This Week and Last Week data from breakdown arrays
                const thisWeekBmcStats = dailyBmcData.length >= 2 ? dailyBmcData[1].data : bmcData;
                const thisWeekSocietyStats = dailySocietyData.length >= 2 ? dailySocietyData[1].data : societyData;
                const lastWeekBmcStats = dailyBmcData.length >= 2 ? dailyBmcData[0].data : lastWeekBmcData;
                const lastWeekSocietyStats = dailySocietyData.length >= 2 ? dailySocietyData[0].data : lastWeekSocietyData;

                const qtyMin = Math.min(
                  thisWeekBmcStats.totalQuantity, 
                  thisWeekSocietyStats.totalQuantity,
                  lastWeekBmcStats.totalQuantity, 
                  lastWeekSocietyStats.totalQuantity
                ) * 0.9;
                const qtyMax = Math.max(
                  thisWeekBmcStats.totalQuantity, 
                  thisWeekSocietyStats.totalQuantity,
                  lastWeekBmcStats.totalQuantity, 
                  lastWeekSocietyStats.totalQuantity
                ) * 1.1;
                const amtMin = Math.min(
                  thisWeekBmcStats.totalAmount, 
                  thisWeekSocietyStats.totalAmount,
                  lastWeekBmcStats.totalAmount, 
                  lastWeekSocietyStats.totalAmount
                ) * 0.9;
                const amtMax = Math.max(
                  thisWeekBmcStats.totalAmount, 
                  thisWeekSocietyStats.totalAmount,
                  lastWeekBmcStats.totalAmount, 
                  lastWeekSocietyStats.totalAmount
                ) * 1.1;
                const fatMin = Math.min(
                  thisWeekBmcStats.weightedFat, 
                  thisWeekSocietyStats.weightedFat,
                  lastWeekBmcStats.weightedFat, 
                  lastWeekSocietyStats.weightedFat
                ) * 0.9;
                const fatMax = Math.max(
                  thisWeekBmcStats.weightedFat, 
                  thisWeekSocietyStats.weightedFat,
                  lastWeekBmcStats.weightedFat, 
                  lastWeekSocietyStats.weightedFat
                ) * 1.1;
                const snfMin = Math.min(
                  thisWeekBmcStats.weightedSnf, 
                  thisWeekSocietyStats.weightedSnf,
                  lastWeekBmcStats.weightedSnf, 
                  lastWeekSocietyStats.weightedSnf
                ) * 0.9;
                const snfMax = Math.max(
                  thisWeekBmcStats.weightedSnf, 
                  thisWeekSocietyStats.weightedSnf,
                  lastWeekBmcStats.weightedSnf, 
                  lastWeekSocietyStats.weightedSnf
                ) * 1.1;
                const clrMin = Math.min(
                  thisWeekBmcStats.weightedClr, 
                  thisWeekSocietyStats.weightedClr,
                  lastWeekBmcStats.weightedClr, 
                  lastWeekSocietyStats.weightedClr
                ) * 0.9;
                const clrMax = Math.max(
                  thisWeekBmcStats.weightedClr, 
                  thisWeekSocietyStats.weightedClr,
                  lastWeekBmcStats.weightedClr, 
                  lastWeekSocietyStats.weightedClr
                ) * 1.1;
                const rateMin = Math.min(
                  thisWeekBmcStats.averageRate, 
                  thisWeekSocietyStats.averageRate,
                  lastWeekBmcStats.averageRate, 
                  lastWeekSocietyStats.averageRate
                ) * 0.9;
                const rateMax = Math.max(
                  thisWeekBmcStats.averageRate, 
                  thisWeekSocietyStats.averageRate,
                  lastWeekBmcStats.averageRate, 
                  lastWeekSocietyStats.averageRate
                ) * 1.1;

                const thisWeekBmcData = [
                  { parameter: 'Quantity', valueBmc: normalize(thisWeekBmcStats.totalQuantity, qtyMin, qtyMax), valueSociety: normalize(thisWeekSocietyStats.totalQuantity, qtyMin, qtyMax), actualBmc: thisWeekBmcStats.totalQuantity, actualSociety: thisWeekSocietyStats.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', valueBmc: normalize(thisWeekBmcStats.totalAmount, amtMin, amtMax), valueSociety: normalize(thisWeekSocietyStats.totalAmount, amtMin, amtMax), actualBmc: thisWeekBmcStats.totalAmount, actualSociety: thisWeekSocietyStats.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', valueBmc: normalize(thisWeekBmcStats.weightedFat, fatMin, fatMax), valueSociety: normalize(thisWeekSocietyStats.weightedFat, fatMin, fatMax), actualBmc: thisWeekBmcStats.weightedFat, actualSociety: thisWeekSocietyStats.weightedFat, unit: '%' },
                  { parameter: 'SNF %', valueBmc: normalize(thisWeekBmcStats.weightedSnf, snfMin, snfMax), valueSociety: normalize(thisWeekSocietyStats.weightedSnf, snfMin, snfMax), actualBmc: thisWeekBmcStats.weightedSnf, actualSociety: thisWeekSocietyStats.weightedSnf, unit: '%' },
                  { parameter: 'CLR', valueBmc: normalize(thisWeekBmcStats.weightedClr, clrMin, clrMax), valueSociety: normalize(thisWeekSocietyStats.weightedClr, clrMin, clrMax), actualBmc: thisWeekBmcStats.weightedClr, actualSociety: thisWeekSocietyStats.weightedClr, unit: '' },
                  { parameter: 'Rate', valueBmc: normalize(thisWeekBmcStats.averageRate, rateMin, rateMax), valueSociety: normalize(thisWeekSocietyStats.averageRate, rateMin, rateMax), actualBmc: thisWeekBmcStats.averageRate, actualSociety: thisWeekSocietyStats.averageRate, unit: '₹/L' }
                ];

                const lastWeekCombinedData = [
                  { parameter: 'Quantity', valueBmc: normalize(lastWeekBmcStats.totalQuantity, qtyMin, qtyMax), valueSociety: normalize(lastWeekSocietyStats.totalQuantity, qtyMin, qtyMax), actualBmc: lastWeekBmcStats.totalQuantity, actualSociety: lastWeekSocietyStats.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', valueBmc: normalize(lastWeekBmcStats.totalAmount, amtMin, amtMax), valueSociety: normalize(lastWeekSocietyStats.totalAmount, amtMin, amtMax), actualBmc: lastWeekBmcStats.totalAmount, actualSociety: lastWeekSocietyStats.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', valueBmc: normalize(lastWeekBmcStats.weightedFat, fatMin, fatMax), valueSociety: normalize(lastWeekSocietyStats.weightedFat, fatMin, fatMax), actualBmc: lastWeekBmcStats.weightedFat, actualSociety: lastWeekSocietyStats.weightedFat, unit: '%' },
                  { parameter: 'SNF %', valueBmc: normalize(lastWeekBmcStats.weightedSnf, snfMin, snfMax), valueSociety: normalize(lastWeekSocietyStats.weightedSnf, snfMin, snfMax), actualBmc: lastWeekBmcStats.weightedSnf, actualSociety: lastWeekSocietyStats.weightedSnf, unit: '%' },
                  { parameter: 'CLR', valueBmc: normalize(lastWeekBmcStats.weightedClr, clrMin, clrMax), valueSociety: normalize(lastWeekSocietyStats.weightedClr, clrMin, clrMax), actualBmc: lastWeekBmcStats.weightedClr, actualSociety: lastWeekSocietyStats.weightedClr, unit: '' },
                  { parameter: 'Rate', valueBmc: normalize(lastWeekBmcStats.averageRate, rateMin, rateMax), valueSociety: normalize(lastWeekSocietyStats.averageRate, rateMin, rateMax), actualBmc: lastWeekBmcStats.averageRate, actualSociety: lastWeekSocietyStats.averageRate, unit: '₹/L' }
                ];

                const combinedData = [
                  { parameter: 'Quantity', thisWeekBmc: normalize(bmcData.totalQuantity, qtyMin, qtyMax), thisWeekSociety: normalize(societyData.totalQuantity, qtyMin, qtyMax), lastWeekBmc: normalize(lastWeekBmcData.totalQuantity, qtyMin, qtyMax), lastWeekSociety: normalize(lastWeekSocietyData.totalQuantity, qtyMin, qtyMax), twBmcActual: bmcData.totalQuantity, twSocietyActual: societyData.totalQuantity, lwBmcActual: lastWeekBmcData.totalQuantity, lwSocietyActual: lastWeekSocietyData.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', thisWeekBmc: normalize(bmcData.totalAmount, amtMin, amtMax), thisWeekSociety: normalize(societyData.totalAmount, amtMin, amtMax), lastWeekBmc: normalize(lastWeekBmcData.totalAmount, amtMin, amtMax), lastWeekSociety: normalize(lastWeekSocietyData.totalAmount, amtMin, amtMax), twBmcActual: bmcData.totalAmount, twSocietyActual: societyData.totalAmount, lwBmcActual: lastWeekBmcData.totalAmount, lwSocietyActual: lastWeekSocietyData.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', thisWeekBmc: normalize(bmcData.weightedFat, fatMin, fatMax), thisWeekSociety: normalize(societyData.weightedFat, fatMin, fatMax), lastWeekBmc: normalize(lastWeekBmcData.weightedFat, fatMin, fatMax), lastWeekSociety: normalize(lastWeekSocietyData.weightedFat, fatMin, fatMax), twBmcActual: bmcData.weightedFat, twSocietyActual: societyData.weightedFat, lwBmcActual: lastWeekBmcData.weightedFat, lwSocietyActual: lastWeekSocietyData.weightedFat, unit: '%' },
                  { parameter: 'SNF %', thisWeekBmc: normalize(bmcData.weightedSnf, snfMin, snfMax), thisWeekSociety: normalize(societyData.weightedSnf, snfMin, snfMax), lastWeekBmc: normalize(lastWeekBmcData.weightedSnf, snfMin, snfMax), lastWeekSociety: normalize(lastWeekSocietyData.weightedSnf, snfMin, snfMax), twBmcActual: bmcData.weightedSnf, twSocietyActual: societyData.weightedSnf, lwBmcActual: lastWeekBmcData.weightedSnf, lwSocietyActual: lastWeekSocietyData.weightedSnf, unit: '%' },
                  { parameter: 'CLR', thisWeekBmc: normalize(bmcData.weightedClr, clrMin, clrMax), thisWeekSociety: normalize(societyData.weightedClr, clrMin, clrMax), lastWeekBmc: normalize(lastWeekBmcData.weightedClr, clrMin, clrMax), lastWeekSociety: normalize(lastWeekSocietyData.weightedClr, clrMin, clrMax), twBmcActual: bmcData.weightedClr, twSocietyActual: societyData.weightedClr, lwBmcActual: lastWeekBmcData.weightedClr, lwSocietyActual: lastWeekSocietyData.weightedClr, unit: '' },
                  { parameter: 'Rate', thisWeekBmc: normalize(bmcData.averageRate, rateMin, rateMax), thisWeekSociety: normalize(societyData.averageRate, rateMin, rateMax), lastWeekBmc: normalize(lastWeekBmcData.averageRate, rateMin, rateMax), lastWeekSociety: normalize(lastWeekSocietyData.averageRate, rateMin, rateMax), twBmcActual: bmcData.averageRate, twSocietyActual: societyData.averageRate, lwBmcActual: lastWeekBmcData.averageRate, lwSocietyActual: lastWeekSocietyData.averageRate, unit: '₹/L' }
                ];

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{timePeriod === 'weekly' ? 'This Week' : timePeriod === 'monthly' ? 'This Month' : 'This Year'} — BMC vs Society</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={thisWeekBmcData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="BMC" dataKey="valueBmc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2.5} />
                            <Radar name="Society" dataKey="valueSociety" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2.5} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                              itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                              formatter={(value: any, name: string, props: any) => {
                                const actual = name === 'BMC' ? props.payload.actualBmc : props.payload.actualSociety;
                                const unit = props.payload.unit;
                                return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">BMC</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{thisWeekBmcStats.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{thisWeekBmcStats.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{thisWeekBmcStats.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{thisWeekBmcStats.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{thisWeekBmcStats.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{thisWeekBmcStats.averageRate.toFixed(2)}/L</span></div>
                          </div>
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-green-600 dark:text-green-400 mb-2">Society</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{thisWeekSocietyStats.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{thisWeekSocietyStats.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{thisWeekSocietyStats.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{thisWeekSocietyStats.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{thisWeekSocietyStats.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{thisWeekSocietyStats.averageRate.toFixed(2)}/L</span></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{timePeriod === 'weekly' ? 'Last Week' : timePeriod === 'monthly' ? 'Last Month' : 'Last Year'} — BMC vs Society</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={lastWeekCombinedData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="BMC" dataKey="valueBmc" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2.5} />
                            <Radar name="Society" dataKey="valueSociety" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} strokeWidth={2.5} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                              itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                              formatter={(value: any, name: string, props: any) => {
                                const actual = name === 'BMC' ? props.payload.actualBmc : props.payload.actualSociety;
                                const unit = props.payload.unit;
                                return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-purple-600 dark:text-purple-400 mb-2">BMC</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{lastWeekBmcStats.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{lastWeekBmcStats.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{lastWeekBmcStats.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{lastWeekBmcStats.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{lastWeekBmcStats.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{lastWeekBmcStats.averageRate.toFixed(2)}/L</span></div>
                          </div>
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Society</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{lastWeekSocietyStats.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{lastWeekSocietyStats.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{lastWeekSocietyStats.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{lastWeekSocietyStats.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{lastWeekSocietyStats.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{lastWeekSocietyStats.averageRate.toFixed(2)}/L</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                      <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Combined Overlay — All 4 Datasets</h4>
                      <ResponsiveContainer width="100%" height={450}>
                        <RadarChart data={combinedData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Radar name={`${timePeriod === 'weekly' ? 'This Week' : timePeriod === 'monthly' ? 'This Month' : 'This Year'} BMC`} dataKey="thisWeekBmc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name={`${timePeriod === 'weekly' ? 'This Week' : timePeriod === 'monthly' ? 'This Month' : 'This Year'} Society`} dataKey="thisWeekSociety" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name={`${timePeriod === 'weekly' ? 'Last Week' : timePeriod === 'monthly' ? 'Last Month' : 'Last Year'} BMC`} dataKey="lastWeekBmc" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name={`${timePeriod === 'weekly' ? 'Last Week' : timePeriod === 'monthly' ? 'Last Month' : 'Last Year'} Society`} dataKey="lastWeekSociety" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2.5} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                            itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                            formatter={(value: any, name: string, props: any) => {
                              const payload = props.payload;
                              let actual;
                              if (name.includes('BMC') && (name.includes('This Week') || name.includes('This Month') || name.includes('This Year'))) actual = payload.twBmcActual;
                              else if (name.includes('Society') && (name.includes('This Week') || name.includes('This Month') || name.includes('This Year'))) actual = payload.twSocietyActual;
                              else if (name.includes('BMC') && (name.includes('Last Week') || name.includes('Last Month') || name.includes('Last Year'))) actual = payload.lwBmcActual;
                              else if (name.includes('Society') && (name.includes('Last Week') || name.includes('Last Month') || name.includes('Last Year'))) actual = payload.lwSocietyActual;
                              const unit = payload.unit;
                              return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </div>
          )}



          {/* Daily Variations Chart */}
          {dailyBmcData.length > 0 && dailySocietyData.length > 0 && (timePeriod === 'daily' || timePeriod === 'weekly') && dateRange.from !== dateRange.to && (
            <div className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Daily Variations - BMC vs Society</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Normalized trends from {dateRange.from} to {dateRange.to}</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-xs font-semibold shadow-lg">
                  0-100 Scale
                </div>
              </div>
              
              {/* Metric Toggle Buttons */}
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { key: 'BMC Qty', label: 'BMC Qty', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500' },
                  { key: 'Society Qty', label: 'Society Qty', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-500' },
                  { key: 'BMC Amt', label: 'BMC Amt', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-500' },
                  { key: 'Society Amt', label: 'Society Amt', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-500' },
                  { key: 'BMC FAT', label: 'BMC FAT', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-500' },
                  { key: 'Society FAT', label: 'Society FAT', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-500' },
                  { key: 'BMC SNF', label: 'BMC SNF', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-500' },
                  { key: 'Society SNF', label: 'Society SNF', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-500' },
                  { key: 'BMC CLR', label: 'BMC CLR', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-500' },
                  { key: 'Society CLR', label: 'Society CLR', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-500' }
                ].map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                      activeMetrics.has(metric.key)
                        ? `${metric.color} shadow-md`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-transparent opacity-50'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
                <ResponsiveContainer width="100%" height={450}>
                  <AreaChart data={dailyBmcData.map((d, idx) => {
                    const societyDay = dailySocietyData[idx];
                    if (!societyDay) return null;
                    
                    const allBmcQty = dailyBmcData.map(day => day.data.totalQuantity);
                    const allSocietyQty = dailySocietyData.map(day => day.data.totalQuantity);
                    const allBmcAmt = dailyBmcData.map(day => day.data.totalAmount);
                    const allSocietyAmt = dailySocietyData.map(day => day.data.totalAmount);
                    const allBmcFat = dailyBmcData.map(day => day.data.weightedFat);
                    const allSocietyFat = dailySocietyData.map(day => day.data.weightedFat);
                    const allBmcSnf = dailyBmcData.map(day => day.data.weightedSnf);
                    const allSocietySnf = dailySocietyData.map(day => day.data.weightedSnf);
                    const allBmcClr = dailyBmcData.map(day => day.data.weightedClr);
                    const allSocietyClr = dailySocietyData.map(day => day.data.weightedClr);

                    const normalize = (value: number, values: number[]) => {
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      if (max === min) return 50;
                      return ((value - min) / (max - min)) * 100;
                    };

                    return {
                      date: d.date.split('-').slice(1).join('/'),
                      'BMC Qty': normalize(d.data.totalQuantity, allBmcQty),
                      'Society Qty': normalize(societyDay.data.totalQuantity, allSocietyQty),
                      'BMC Amt': normalize(d.data.totalAmount, allBmcAmt),
                      'Society Amt': normalize(societyDay.data.totalAmount, allSocietyAmt),
                      'BMC FAT': normalize(d.data.weightedFat, allBmcFat),
                      'Society FAT': normalize(societyDay.data.weightedFat, allSocietyFat),
                      'BMC SNF': normalize(d.data.weightedSnf, allBmcSnf),
                      'Society SNF': normalize(societyDay.data.weightedSnf, allSocietySnf),
                      'BMC CLR': normalize(d.data.weightedClr, allBmcClr),
                      'Society CLR': normalize(societyDay.data.weightedClr, allSocietyClr),
                      bmcQtyActual: d.data.totalQuantity,
                      societyQtyActual: societyDay.data.totalQuantity,
                      bmcAmtActual: d.data.totalAmount,
                      societyAmtActual: societyDay.data.totalAmount,
                      bmcFatActual: d.data.weightedFat,
                      societyFatActual: societyDay.data.weightedFat,
                      bmcSnfActual: d.data.weightedSnf,
                      societySnfActual: societyDay.data.weightedSnf,
                      bmcClrActual: d.data.weightedClr,
                      societyClrActual: societyDay.data.weightedClr
                    };
                  }).filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorBmcQty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSocietyQty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBmcAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSocietyAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBmcFAT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSocietyFAT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBmcSNF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSocietySNF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBmcCLR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSocietyCLR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      stroke="#6b7280"
                      label={{ value: 'Date (MM/DD)', position: 'insideBottom', offset: -10, style: { fontSize: 12, fill: '#6b7280', fontWeight: 600 } }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      stroke="#6b7280"
                      domain={[0, 100]}
                      label={{ value: 'Normalized Value (0-100)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280', fontWeight: 600 } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                      itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                      formatter={(value: any, name: string, props: any) => {
                        const payload = props.payload;
                        if (name === 'BMC Qty') return [`${payload.bmcQtyActual.toFixed(2)} L`, name];
                        if (name === 'Society Qty') return [`${payload.societyQtyActual.toFixed(2)} L`, name];
                        if (name === 'BMC Amt') return [`₹${payload.bmcAmtActual.toFixed(2)}`, name];
                        if (name === 'Society Amt') return [`₹${payload.societyAmtActual.toFixed(2)}`, name];
                        if (name === 'BMC FAT') return [`${payload.bmcFatActual.toFixed(2)}%`, name];
                        if (name === 'Society FAT') return [`${payload.societyFatActual.toFixed(2)}%`, name];
                        if (name === 'BMC SNF') return [`${payload.bmcSnfActual.toFixed(2)}%`, name];
                        if (name === 'Society SNF') return [`${payload.societySnfActual.toFixed(2)}%`, name];
                        if (name === 'BMC CLR') return [`${payload.bmcClrActual.toFixed(2)}`, name];
                        if (name === 'Society CLR') return [`${payload.societyClrActual.toFixed(2)}`, name];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    {activeMetrics.has('BMC Qty') && (
                      <Area 
                        type="monotone" 
                        dataKey="BMC Qty" 
                        stroke="#3b82f6" 
                        strokeWidth={2.5}
                        fill="url(#colorBmcQty)"
                      />
                    )}
                    {activeMetrics.has('Society Qty') && (
                      <Area 
                        type="monotone" 
                        dataKey="Society Qty" 
                        stroke="#10b981" 
                        strokeWidth={2.5}
                        fill="url(#colorSocietyQty)"
                      />
                    )}
                    {activeMetrics.has('BMC Amt') && (
                      <Area 
                        type="monotone" 
                        dataKey="BMC Amt" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fill="url(#colorBmcAmt)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('Society Amt') && (
                      <Area 
                        type="monotone" 
                        dataKey="Society Amt" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        fill="url(#colorSocietyAmt)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('BMC FAT') && (
                      <Area 
                        type="monotone" 
                        dataKey="BMC FAT" 
                        stroke="#ec4899" 
                        strokeWidth={2}
                        fill="url(#colorBmcFAT)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('Society FAT') && (
                      <Area 
                        type="monotone" 
                        dataKey="Society FAT" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        fill="url(#colorSocietyFAT)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('BMC SNF') && (
                      <Area 
                        type="monotone" 
                        dataKey="BMC SNF" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fill="url(#colorBmcSNF)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('Society SNF') && (
                      <Area 
                        type="monotone" 
                        dataKey="Society SNF" 
                        stroke="#84cc16" 
                        strokeWidth={2}
                        fill="url(#colorSocietySNF)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('BMC CLR') && (
                      <Area 
                        type="monotone" 
                        dataKey="BMC CLR" 
                        stroke="#f43f5e" 
                        strokeWidth={2}
                        fill="url(#colorBmcCLR)"
                        fillOpacity={0.6}
                      />
                    )}
                    {activeMetrics.has('Society CLR') && (
                      <Area 
                        type="monotone" 
                        dataKey="Society CLR" 
                        stroke="#14b8a6" 
                        strokeWidth={2}
                        fill="url(#colorSocietyCLR)"
                        fillOpacity={0.6}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                {(() => {
                  const getRange = (values: number[]) => {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    return { min, max };
                  };

                  const bmcQtyRange = getRange(dailyBmcData.map(d => d.data.totalQuantity));
                  const societyQtyRange = getRange(dailySocietyData.map(d => d.data.totalQuantity));
                  const bmcAmtRange = getRange(dailyBmcData.map(d => d.data.totalAmount));
                  const societyAmtRange = getRange(dailySocietyData.map(d => d.data.totalAmount));
                  const bmcFatRange = getRange(dailyBmcData.map(d => d.data.weightedFat));
                  const societyFatRange = getRange(dailySocietyData.map(d => d.data.weightedFat));
                  const bmcSnfRange = getRange(dailyBmcData.map(d => d.data.weightedSnf));
                  const societySnfRange = getRange(dailySocietyData.map(d => d.data.weightedSnf));
                  const bmcClrRange = getRange(dailyBmcData.map(d => d.data.weightedClr));
                  const societyClrRange = getRange(dailySocietyData.map(d => d.data.weightedClr));

                  return (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        BMC Qty: {bmcQtyRange.min.toFixed(0)}-{bmcQtyRange.max.toFixed(0)}L
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Society Qty: {societyQtyRange.min.toFixed(0)}-{societyQtyRange.max.toFixed(0)}L
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        BMC Amt: ₹{bmcAmtRange.min.toFixed(0)}-₹{bmcAmtRange.max.toFixed(0)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Society Amt: ₹{societyAmtRange.min.toFixed(0)}-₹{societyAmtRange.max.toFixed(0)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        BMC FAT: {bmcFatRange.min.toFixed(1)}-{bmcFatRange.max.toFixed(1)}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        Society FAT: {societyFatRange.min.toFixed(1)}-{societyFatRange.max.toFixed(1)}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        BMC SNF: {bmcSnfRange.min.toFixed(1)}-{bmcSnfRange.max.toFixed(1)}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                        Society SNF: {societySnfRange.min.toFixed(1)}-{societySnfRange.max.toFixed(1)}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        BMC CLR: {bmcClrRange.min.toFixed(1)}-{bmcClrRange.max.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Society CLR: {societyClrRange.min.toFixed(1)}-{societyClrRange.max.toFixed(1)}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Daily Radar Chart - Today vs Yesterday */}
          {timePeriod === 'daily' && dailyBmcData.length > 0 && dailySocietyData.length > 0 && lastWeekBmcData && lastWeekSocietyData && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Daily Comparison — Radar Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Today vs Yesterday normalized to 0-100 scale</p>
              
              {(() => {
                const normalize = (value: number, min: number, max: number) => {
                  if (max === min) return 50;
                  return ((value - min) / (max - min)) * 100;
                };

                const qtyMin = Math.min(
                  bmcData.totalQuantity, 
                  societyData.totalQuantity,
                  lastWeekBmcData.totalQuantity, 
                  lastWeekSocietyData.totalQuantity
                ) * 0.9;
                const qtyMax = Math.max(
                  bmcData.totalQuantity, 
                  societyData.totalQuantity,
                  lastWeekBmcData.totalQuantity, 
                  lastWeekSocietyData.totalQuantity
                ) * 1.1;
                const amtMin = Math.min(
                  bmcData.totalAmount, 
                  societyData.totalAmount,
                  lastWeekBmcData.totalAmount, 
                  lastWeekSocietyData.totalAmount
                ) * 0.9;
                const amtMax = Math.max(
                  bmcData.totalAmount, 
                  societyData.totalAmount,
                  lastWeekBmcData.totalAmount, 
                  lastWeekSocietyData.totalAmount
                ) * 1.1;
                const fatMin = Math.min(
                  bmcData.weightedFat, 
                  societyData.weightedFat,
                  lastWeekBmcData.weightedFat, 
                  lastWeekSocietyData.weightedFat
                ) * 0.9;
                const fatMax = Math.max(
                  bmcData.weightedFat, 
                  societyData.weightedFat,
                  lastWeekBmcData.weightedFat, 
                  lastWeekSocietyData.weightedFat
                ) * 1.1;
                const snfMin = Math.min(
                  bmcData.weightedSnf, 
                  societyData.weightedSnf,
                  lastWeekBmcData.weightedSnf, 
                  lastWeekSocietyData.weightedSnf
                ) * 0.9;
                const snfMax = Math.max(
                  bmcData.weightedSnf, 
                  societyData.weightedSnf,
                  lastWeekBmcData.weightedSnf, 
                  lastWeekSocietyData.weightedSnf
                ) * 1.1;
                const clrMin = Math.min(
                  bmcData.weightedClr, 
                  societyData.weightedClr,
                  lastWeekBmcData.weightedClr, 
                  lastWeekSocietyData.weightedClr
                ) * 0.9;
                const clrMax = Math.max(
                  bmcData.weightedClr, 
                  societyData.weightedClr,
                  lastWeekBmcData.weightedClr, 
                  lastWeekSocietyData.weightedClr
                ) * 1.1;
                const rateMin = Math.min(
                  bmcData.averageRate, 
                  societyData.averageRate,
                  lastWeekBmcData.averageRate, 
                  lastWeekSocietyData.averageRate
                ) * 0.9;
                const rateMax = Math.max(
                  bmcData.averageRate, 
                  societyData.averageRate,
                  lastWeekBmcData.averageRate, 
                  lastWeekSocietyData.averageRate
                ) * 1.1;

                const currentPeriodData = [
                  { parameter: 'Quantity', valueBmc: normalize(bmcData.totalQuantity, qtyMin, qtyMax), valueSociety: normalize(societyData.totalQuantity, qtyMin, qtyMax), actualBmc: bmcData.totalQuantity, actualSociety: societyData.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', valueBmc: normalize(bmcData.totalAmount, amtMin, amtMax), valueSociety: normalize(societyData.totalAmount, amtMin, amtMax), actualBmc: bmcData.totalAmount, actualSociety: societyData.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', valueBmc: normalize(bmcData.weightedFat, fatMin, fatMax), valueSociety: normalize(societyData.weightedFat, fatMin, fatMax), actualBmc: bmcData.weightedFat, actualSociety: societyData.weightedFat, unit: '%' },
                  { parameter: 'SNF %', valueBmc: normalize(bmcData.weightedSnf, snfMin, snfMax), valueSociety: normalize(societyData.weightedSnf, snfMin, snfMax), actualBmc: bmcData.weightedSnf, actualSociety: societyData.weightedSnf, unit: '%' },
                  { parameter: 'CLR', valueBmc: normalize(bmcData.weightedClr, clrMin, clrMax), valueSociety: normalize(societyData.weightedClr, clrMin, clrMax), actualBmc: bmcData.weightedClr, actualSociety: societyData.weightedClr, unit: '' },
                  { parameter: 'Rate', valueBmc: normalize(bmcData.averageRate, rateMin, rateMax), valueSociety: normalize(societyData.averageRate, rateMin, rateMax), actualBmc: bmcData.averageRate, actualSociety: societyData.averageRate, unit: '₹/L' }
                ];

                const previousPeriodData = [
                  { parameter: 'Quantity', valueBmc: normalize(lastWeekBmcData.totalQuantity, qtyMin, qtyMax), valueSociety: normalize(lastWeekSocietyData.totalQuantity, qtyMin, qtyMax), actualBmc: lastWeekBmcData.totalQuantity, actualSociety: lastWeekSocietyData.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', valueBmc: normalize(lastWeekBmcData.totalAmount, amtMin, amtMax), valueSociety: normalize(lastWeekSocietyData.totalAmount, amtMin, amtMax), actualBmc: lastWeekBmcData.totalAmount, actualSociety: lastWeekSocietyData.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', valueBmc: normalize(lastWeekBmcData.weightedFat, fatMin, fatMax), valueSociety: normalize(lastWeekSocietyData.weightedFat, fatMin, fatMax), actualBmc: lastWeekBmcData.weightedFat, actualSociety: lastWeekSocietyData.weightedFat, unit: '%' },
                  { parameter: 'SNF %', valueBmc: normalize(lastWeekBmcData.weightedSnf, snfMin, snfMax), valueSociety: normalize(lastWeekSocietyData.weightedSnf, snfMin, snfMax), actualBmc: lastWeekBmcData.weightedSnf, actualSociety: lastWeekSocietyData.weightedSnf, unit: '%' },
                  { parameter: 'CLR', valueBmc: normalize(lastWeekBmcData.weightedClr, clrMin, clrMax), valueSociety: normalize(lastWeekSocietyData.weightedClr, clrMin, clrMax), actualBmc: lastWeekBmcData.weightedClr, actualSociety: lastWeekSocietyData.weightedClr, unit: '' },
                  { parameter: 'Rate', valueBmc: normalize(lastWeekBmcData.averageRate, rateMin, rateMax), valueSociety: normalize(lastWeekSocietyData.averageRate, rateMin, rateMax), actualBmc: lastWeekBmcData.averageRate, actualSociety: lastWeekSocietyData.averageRate, unit: '₹/L' }
                ];

                const combinedData = [
                  { parameter: 'Quantity', currentBmc: normalize(bmcData.totalQuantity, qtyMin, qtyMax), currentSociety: normalize(societyData.totalQuantity, qtyMin, qtyMax), previousBmc: normalize(lastWeekBmcData.totalQuantity, qtyMin, qtyMax), previousSociety: normalize(lastWeekSocietyData.totalQuantity, qtyMin, qtyMax), cpBmcActual: bmcData.totalQuantity, cpSocietyActual: societyData.totalQuantity, ppBmcActual: lastWeekBmcData.totalQuantity, ppSocietyActual: lastWeekSocietyData.totalQuantity, unit: 'L' },
                  { parameter: 'Amount', currentBmc: normalize(bmcData.totalAmount, amtMin, amtMax), currentSociety: normalize(societyData.totalAmount, amtMin, amtMax), previousBmc: normalize(lastWeekBmcData.totalAmount, amtMin, amtMax), previousSociety: normalize(lastWeekSocietyData.totalAmount, amtMin, amtMax), cpBmcActual: bmcData.totalAmount, cpSocietyActual: societyData.totalAmount, ppBmcActual: lastWeekBmcData.totalAmount, ppSocietyActual: lastWeekSocietyData.totalAmount, unit: '₹' },
                  { parameter: 'FAT %', currentBmc: normalize(bmcData.weightedFat, fatMin, fatMax), currentSociety: normalize(societyData.weightedFat, fatMin, fatMax), previousBmc: normalize(lastWeekBmcData.weightedFat, fatMin, fatMax), previousSociety: normalize(lastWeekSocietyData.weightedFat, fatMin, fatMax), cpBmcActual: bmcData.weightedFat, cpSocietyActual: societyData.weightedFat, ppBmcActual: lastWeekBmcData.weightedFat, ppSocietyActual: lastWeekSocietyData.weightedFat, unit: '%' },
                  { parameter: 'SNF %', currentBmc: normalize(bmcData.weightedSnf, snfMin, snfMax), currentSociety: normalize(societyData.weightedSnf, snfMin, snfMax), previousBmc: normalize(lastWeekBmcData.weightedSnf, snfMin, snfMax), previousSociety: normalize(lastWeekSocietyData.weightedSnf, snfMin, snfMax), cpBmcActual: bmcData.weightedSnf, cpSocietyActual: societyData.weightedSnf, ppBmcActual: lastWeekBmcData.weightedSnf, ppSocietyActual: lastWeekSocietyData.weightedSnf, unit: '%' },
                  { parameter: 'CLR', currentBmc: normalize(bmcData.weightedClr, clrMin, clrMax), currentSociety: normalize(societyData.weightedClr, clrMin, clrMax), previousBmc: normalize(lastWeekBmcData.weightedClr, clrMin, clrMax), previousSociety: normalize(lastWeekSocietyData.weightedClr, clrMin, clrMax), cpBmcActual: bmcData.weightedClr, cpSocietyActual: societyData.weightedClr, ppBmcActual: lastWeekBmcData.weightedClr, ppSocietyActual: lastWeekSocietyData.weightedClr, unit: '' },
                  { parameter: 'Rate', currentBmc: normalize(bmcData.averageRate, rateMin, rateMax), currentSociety: normalize(societyData.averageRate, rateMin, rateMax), previousBmc: normalize(lastWeekBmcData.averageRate, rateMin, rateMax), previousSociety: normalize(lastWeekSocietyData.averageRate, rateMin, rateMax), cpBmcActual: bmcData.averageRate, cpSocietyActual: societyData.averageRate, ppBmcActual: lastWeekBmcData.averageRate, ppSocietyActual: lastWeekSocietyData.averageRate, unit: '₹/L' }
                ];

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Today — BMC vs Society</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={currentPeriodData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="BMC" dataKey="valueBmc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2.5} />
                            <Radar name="Society" dataKey="valueSociety" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2.5} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                              itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                              formatter={(value: any, name: string, props: any) => {
                                const actual = name === 'BMC' ? props.payload.actualBmc : props.payload.actualSociety;
                                const unit = props.payload.unit;
                                return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">BMC</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{bmcData.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{bmcData.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{bmcData.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{bmcData.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{bmcData.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{bmcData.averageRate.toFixed(2)}/L</span></div>
                          </div>
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-green-600 dark:text-green-400 mb-2">Society</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{societyData.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{societyData.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{societyData.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{societyData.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{societyData.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{societyData.averageRate.toFixed(2)}/L</span></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Yesterday — BMC vs Society</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={previousPeriodData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="BMC" dataKey="valueBmc" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2.5} />
                            <Radar name="Society" dataKey="valueSociety" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} strokeWidth={2.5} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                              itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                              formatter={(value: any, name: string, props: any) => {
                                const actual = name === 'BMC' ? props.payload.actualBmc : props.payload.actualSociety;
                                const unit = props.payload.unit;
                                return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-purple-600 dark:text-purple-400 mb-2">BMC</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{lastWeekBmcData.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{lastWeekBmcData.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{lastWeekBmcData.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{lastWeekBmcData.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{lastWeekBmcData.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{lastWeekBmcData.averageRate.toFixed(2)}/L</span></div>
                          </div>
                          <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Society</div>
                            <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{lastWeekSocietyData.totalQuantity.toFixed(2)} L</span></div>
                            <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{lastWeekSocietyData.totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{lastWeekSocietyData.weightedFat.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{lastWeekSocietyData.weightedSnf.toFixed(2)}%</span></div>
                            <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{lastWeekSocietyData.weightedClr.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{lastWeekSocietyData.averageRate.toFixed(2)}/L</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                      <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Combined Overlay — All 4 Datasets</h4>
                      <ResponsiveContainer width="100%" height={450}>
                        <RadarChart data={combinedData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Radar name="Today BMC" dataKey="currentBmc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name="Today Society" dataKey="currentSociety" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name="Yesterday BMC" dataKey="previousBmc" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2.5} />
                          <Radar name="Yesterday Society" dataKey="previousSociety" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2.5} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(75, 85, 99, 0.5)', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}
                            itemStyle={{ color: '#e5e7eb', fontSize: '12px', padding: '4px 0' }}
                            formatter={(value: any, name: string, props: any) => {
                              const payload = props.payload;
                              let actual;
                              if (name === 'Today BMC') actual = payload.cpBmcActual;
                              else if (name === 'Today Society') actual = payload.cpSocietyActual;
                              else if (name === 'Yesterday BMC') actual = payload.ppBmcActual;
                              else if (name === 'Yesterday Society') actual = payload.ppSocietyActual;
                              const unit = payload.unit;
                              return [unit === '₹' ? `${unit}${actual.toFixed(2)}` : unit === '₹/L' ? `${unit.replace('/L', '')}${actual.toFixed(2)}/L` : `${actual.toFixed(2)}${unit}`, name];
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
