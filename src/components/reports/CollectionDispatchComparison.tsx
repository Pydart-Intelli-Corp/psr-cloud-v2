'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  totalRecords: number;
  totalQuantity: number;
  weightedFat: number;
  weightedSnf: number;
  weightedClr: number;
  totalAmount: number;
  averageRate: number;
}

interface CollectionDispatchComparisonProps {
  currentDate: { from: string; to: string; label: string };
  previousDate: { from: string; to: string; label: string };
  dairyFilter?: string[];
  bmcFilter?: string[];
  societyFilter?: string[];
  onDairyChange?: (value: string[]) => void;
  onBmcChange?: (value: string[]) => void;
  onSocietyChange?: (value: string[]) => void;
  reportSource?: 'society' | 'bmc';
  timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export default function CollectionDispatchComparison({ 
  currentDate,
  previousDate,
  dairyFilter = [],
  bmcFilter = [],
  societyFilter = [],
  onDairyChange,
  onBmcChange,
  onSocietyChange,
  reportSource = 'society',
  timePeriod = 'daily'
}: CollectionDispatchComparisonProps) {
  const [collectionData, setCollectionData] = useState<ComparisonData | null>(null);
  const [dispatchData, setDispatchData] = useState<ComparisonData | null>(null);
  const [dailyCollectionData, setDailyCollectionData] = useState<Array<{ date: string; data: ComparisonData }>>([]);
  const [dailyDispatchData, setDailyDispatchData] = useState<Array<{ date: string; data: ComparisonData }>>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter data states
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: number; name: string; society_id: string; bmc_id?: number }>>([]);
  
  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    console.log('📡 Starting fetchFilterOptions (CollectionDispatch)...');
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) return;
      
      console.log('📡 Fetching dairies, bmcs, societies...');
      
      // Fetch dairies
      const dairiesRes = await fetch('/api/user/dairy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dairiesRes.ok) {
        const dairiesData = await dairiesRes.json();
        const dairiesList = dairiesData.data || [];
        console.log('✅ Comparison - Dairies fetched:', dairiesList.length, dairiesList);
        setDairies(dairiesList);
      } else {
        console.error('❌ Dairies fetch failed:', dairiesRes.status, dairiesRes.statusText);
      }
      
      // Fetch BMCs
      const bmcsRes = await fetch('/api/user/bmc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bmcsRes.ok) {
        const bmcsData = await bmcsRes.json();
        const bmcsList = bmcsData.data || [];
        console.log('✅ Comparison - BMCs fetched:', bmcsList.length, bmcsList);
        setBmcs(bmcsList);
      } else {
        console.error('❌ BMCs fetch failed:', bmcsRes.status, bmcsRes.statusText);
      }
      
      // Fetch Societies
      const societiesRes = await fetch('/api/user/society', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (societiesRes.ok) {
        const societiesData = await societiesRes.json();
        const societiesList = societiesData.data || [];
        console.log('✅ Comparison - Societies fetched:', societiesList.length, societiesList);
        setSocieties(societiesList);
      } else {
        console.error('❌ Societies fetch failed:', societiesRes.status, societiesRes.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
    }
  };

  // Create stable dependency key
  const dependencyKey = `${currentDate.from}-${currentDate.to}-${previousDate.from}-${previousDate.to}-${dairyFilter.join(',')}-${bmcFilter.join(',')}-${societyFilter.join(',')}`;

  useEffect(() => {
    fetchComparisonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('===== Collection vs Dispatch Comparison Debug =====');
      console.log('Current Date Range:', currentDate);
      console.log('Previous Date Range:', previousDate);
      
      // Fetch all collection data - use BMC endpoint if reportSource is 'bmc'
      const collectionEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-collections'
        : '/api/user/reports/collections';
      
      const collectionRes = await fetch(
        collectionEndpoint,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!collectionRes.ok) {
        console.error('Collection API Error:', collectionRes.status, collectionRes.statusText);
        setLoading(false);
        return;
      }
      
      const collectionJson = await collectionRes.json();
      
      // Fetch all dispatch data - use BMC endpoint if reportSource is 'bmc'
      const dispatchEndpoint = reportSource === 'bmc'
        ? '/api/user/reports/bmc-dispatches'
        : '/api/user/reports/dispatches';
      
      const dispatchRes = await fetch(
        dispatchEndpoint,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!dispatchRes.ok) {
        console.error('Dispatch API Error:', dispatchRes.status, dispatchRes.statusText);
        setLoading(false);
        return;
      }
      
      const dispatchJson = await dispatchRes.json();

      console.log('All Collection Records:', collectionJson?.length || 0);
      console.log('All Dispatch Records:', dispatchJson?.length || 0);
      
      if (dispatchJson && dispatchJson.length > 0) {
        console.log('Sample Dispatch Record Structure:', dispatchJson[0]);
        console.log('Dispatch Date Fields:', {
          dispatch_date: dispatchJson[0].dispatch_date,
          date: dispatchJson[0].date,
          dispatch_time: dispatchJson[0].dispatch_time
        });
        console.log('First 3 dispatch dates:', dispatchJson.slice(0, 3).map((r: any) => ({
          id: r.id,
          dispatch_date: r.dispatch_date,
          date: r.date
        })));
      }

      // Filter and calculate statistics for collection
      const allCollectionRecords = collectionJson || [];
      const collectionRecords = allCollectionRecords.filter((r: any) => {
        const recordDate = r.collection_date || r.date;
        const isInRange = recordDate >= currentDate.from && recordDate <= currentDate.to;
        
        if (!isInRange) return false;
        
        // Apply dairy filter
        if (dairyFilter.length > 0) {
          const selectedDairyIds = dairyFilter.map(id => {
            const dairy = dairies.find(d => d.id.toString() === id);
            return dairy?.id;
          }).filter(Boolean) as number[];
          if (selectedDairyIds.length > 0 && (!r.dairy_id || !selectedDairyIds.includes(r.dairy_id))) {
            return false;
          }
        }
        
        // Apply BMC filter
        if (bmcFilter.length > 0) {
          const selectedBmcIds = bmcFilter.map(id => {
            const bmc = bmcs.find(b => b.id.toString() === id);
            return bmc?.id;
          }).filter(Boolean) as number[];
          if (selectedBmcIds.length > 0 && (!r.bmc_id || !selectedBmcIds.includes(r.bmc_id))) {
            return false;
          }
        }
        
        // Apply society filter
        if (societyFilter.length > 0) {
          const selectedSocietyIds = societyFilter.map(id => {
            const society = societies.find(s => s.id.toString() === id);
            return society?.society_id;
          }).filter(Boolean) as string[];
          if (selectedSocietyIds.length > 0 && (!r.society_id || !selectedSocietyIds.includes(r.society_id))) {
            return false;
          }
        }
        
        console.log('Collection record in range:', {
          date: recordDate,
          quantity: r.quantity,
          clr: r.clr
        });
        return true;
      });
      console.log('Filtered Collection Records:', collectionRecords.length);
      const collectionStats = calculateStats(collectionRecords, 'collection');
      console.log('Collection Stats:', collectionStats);
      setCollectionData(collectionStats);

      // Filter and calculate statistics for dispatch
      const allDispatchRecords = dispatchJson || [];
      const dispatchRecords = allDispatchRecords.filter((r: any) => {
        const recordDate = r.dispatch_date || r.date;
        const isInRange = recordDate >= currentDate.from && recordDate <= currentDate.to;
        
        if (!isInRange) return false;
        
        // Apply dairy filter
        if (dairyFilter.length > 0) {
          const selectedDairyIds = dairyFilter.map(id => {
            const dairy = dairies.find(d => d.id.toString() === id);
            return dairy?.id;
          }).filter(Boolean) as number[];
          if (selectedDairyIds.length > 0 && (!r.dairy_id || !selectedDairyIds.includes(r.dairy_id))) {
            return false;
          }
        }
        
        // Apply BMC filter
        if (bmcFilter.length > 0) {
          const selectedBmcIds = bmcFilter.map(id => {
            const bmc = bmcs.find(b => b.id.toString() === id);
            return bmc?.id;
          }).filter(Boolean) as number[];
          if (selectedBmcIds.length > 0 && (!r.bmc_id || !selectedBmcIds.includes(r.bmc_id))) {
            return false;
          }
        }
        
        // Apply society filter
        if (societyFilter.length > 0) {
          const selectedSocietyIds = societyFilter.map(id => {
            const society = societies.find(s => s.id.toString() === id);
            return society?.society_id;
          }).filter(Boolean) as string[];
          if (selectedSocietyIds.length > 0 && (!r.society_id || !selectedSocietyIds.includes(r.society_id))) {
            return false;
          }
        }
        
        console.log('Dispatch filter check:', {
          id: r.id,
          dispatch_date: r.dispatch_date,
          date: r.date,
          recordDate: recordDate,
          dateRangeFrom: currentDate.from,
          dateRangeTo: currentDate.to,
          isInRange: isInRange
        });
        console.log('Dispatch record in range:', {
          date: recordDate,
          quantity: r.quantity,
          clr_value: r.clr_value,
          clr: r.clr
        });
        return isInRange;
      });
      console.log('Filtered Dispatch Records:', dispatchRecords.length);
      
      // Show data availability info
      if (dispatchRecords.length === 0 && allDispatchRecords.length > 0) {
        const dispatchDates = allDispatchRecords.map((r: any) => r.dispatch_date).sort();
        console.warn(`⚠️ NO DISPATCH DATA for ${currentDate.from} to ${currentDate.to}`);
        console.warn(`Available dispatch dates: ${dispatchDates[0]} to ${dispatchDates[dispatchDates.length - 1]}`);
      }
      
      const dispatchStats = calculateStats(dispatchRecords, 'dispatch');
      console.log('Dispatch Stats:', dispatchStats);
      setDispatchData(dispatchStats);

      // Calculate daily variations if in daily mode with date range
      if (timePeriod === 'daily' && currentDate.from !== currentDate.to) {
        const dailyCollectionBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const dailyDispatchBreakdown: Array<{ date: string; data: ComparisonData }> = [];
        const startDate = new Date(currentDate.from);
        const endDate = new Date(currentDate.to);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          
          const dayCollectionRecords = collectionRecords.filter((r: any) => {
            const recordDate = r.collection_date || r.date;
            return recordDate === dateStr;
          });
          dailyCollectionBreakdown.push({
            date: dateStr,
            data: calculateStats(dayCollectionRecords, 'collection')
          });
          
          const dayDispatchRecords = dispatchRecords.filter((r: any) => {
            const recordDate = r.dispatch_date || r.date;
            return recordDate === dateStr;
          });
          dailyDispatchBreakdown.push({
            date: dateStr,
            data: calculateStats(dayDispatchRecords, 'dispatch')
          });
        }
        setDailyCollectionData(dailyCollectionBreakdown);
        setDailyDispatchData(dailyDispatchBreakdown);
      } else {
        setDailyCollectionData([]);
        setDailyDispatchData([]);
      }

    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: any[], type: string): ComparisonData => {
    console.log(`calculateStats for ${type}:`, records.length, 'records');
    
    if (records.length === 0) {
      console.log(`No ${type} records - returning zeros`);
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

    console.log(`Sample ${type} record:`, records[0]);

    const totalQuantity = records.reduce((sum, r) => {
      const qty = parseFloat(r.quantity) || 0;
      return sum + qty;
    }, 0);
    
    console.log(`${type} total quantity:`, totalQuantity);
    
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);
    
    const weightedFat = records.reduce((sum, r) => 
      sum + ((parseFloat(r.fat_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    const weightedSnf = records.reduce((sum, r) => 
      sum + ((parseFloat(r.snf_percentage) || 0) * (parseFloat(r.quantity) || 0)), 0
    ) / (totalQuantity || 1);
    
    // Handle both 'clr' (collection) and 'clr_value' (dispatch) field names
    const weightedClr = records.reduce((sum, r) => {
      const clrValue = parseFloat(r.clr || r.clr_value) || 0;
      if (type === 'dispatch') {
        console.log(`Dispatch CLR - clr_value: ${r.clr_value}, clr: ${r.clr}, parsed: ${clrValue}, qty: ${r.quantity}`);
      }
      return sum + (clrValue * (parseFloat(r.quantity) || 0));
    }, 0) / (totalQuantity || 1);

    const result = {
      totalRecords: records.length,
      totalQuantity,
      weightedFat,
      weightedSnf,
      weightedClr,
      totalAmount,
      averageRate: totalAmount / (totalQuantity || 1)
    };
    
    console.log(`${type} calculated stats:`, result);
    return result;
  };

  const exportToCSV = () => {
    if (!collectionData || !dispatchData) return;

    const currentDateTime = new Date().toLocaleString('en-IN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });

    // Get filter details
    const selectedDairy = dairyFilter.length > 0 ? dairies.find(d => d.id.toString() === dairyFilter[0]) : null;
    const selectedBmc = bmcFilter.length > 0 ? bmcs.find(b => b.id.toString() === bmcFilter[0]) : null;
    const selectedSociety = societyFilter.length > 0 ? societies.find(s => s.id.toString() === societyFilter[0]) : null;

    let csvContent = [
      'POORNASREE EQUIPMENTS - Collection vs Dispatch Comparison Report',
      'LactoConnect Milk Collection System',
      '',
      `Report Generated: ${currentDateTime}`,
      `Period: ${currentDate.label} (${currentDate.from} to ${currentDate.to})`,
      ''
    ];

    // Add filter information
    if (selectedDairy || selectedBmc || selectedSociety) {
      csvContent.push('FILTERS APPLIED', '');
      if (selectedDairy) csvContent.push(`Dairy: ${selectedDairy.name} (${selectedDairy.dairyId})`);
      if (selectedBmc) csvContent.push(`BMC: ${selectedBmc.name} (${selectedBmc.bmcId})`);
      if (selectedSociety) csvContent.push(`Society: ${selectedSociety.name} (${selectedSociety.society_id})`);
      csvContent.push('');
    }

    if (dailyCollectionData.length > 0 && dailyDispatchData.length > 0) {
      csvContent.push('DAY-BY-DAY BREAKDOWN', '');
      csvContent.push('Date,Type,Records,Quantity (L),FAT (%),SNF (%),CLR,Amount (Rs),Rate (Rs/L)');
      dailyCollectionData.forEach((day, idx) => {
        const dispatchDay = dailyDispatchData[idx];
        csvContent.push(`${day.date},Collection,${day.data.totalRecords},${day.data.totalQuantity.toFixed(2)},${day.data.weightedFat.toFixed(2)},${day.data.weightedSnf.toFixed(2)},${day.data.weightedClr.toFixed(2)},${day.data.totalAmount.toFixed(2)},${day.data.averageRate.toFixed(2)}`);
        csvContent.push(`${day.date},Dispatch,${dispatchDay.data.totalRecords},${dispatchDay.data.totalQuantity.toFixed(2)},${dispatchDay.data.weightedFat.toFixed(2)},${dispatchDay.data.weightedSnf.toFixed(2)},${dispatchDay.data.weightedClr.toFixed(2)},${dispatchDay.data.totalAmount.toFixed(2)},${dispatchDay.data.averageRate.toFixed(2)}`);
        csvContent.push(`${day.date},Difference,${(day.data.totalRecords - dispatchDay.data.totalRecords).toFixed(0)},${(day.data.totalQuantity - dispatchDay.data.totalQuantity).toFixed(2)},${(day.data.weightedFat - dispatchDay.data.weightedFat).toFixed(2)},${(day.data.weightedSnf - dispatchDay.data.weightedSnf).toFixed(2)},${(day.data.weightedClr - dispatchDay.data.weightedClr).toFixed(2)},${(day.data.totalAmount - dispatchDay.data.totalAmount).toFixed(2)},${(day.data.averageRate - dispatchDay.data.averageRate).toFixed(2)}`);
      });
      csvContent.push('');
    }

    csvContent = csvContent.concat([
      'SUMMARY',
      '',
      'Metric,Total Records,Total Quantity (L),Weighted FAT (%),Weighted SNF (%),Weighted CLR,Total Amount (Rs),Avg Rate (Rs/L)',
      `Collection,${collectionData.totalRecords},${collectionData.totalQuantity.toFixed(2)},${collectionData.weightedFat.toFixed(2)},${collectionData.weightedSnf.toFixed(2)},${collectionData.weightedClr.toFixed(2)},${collectionData.totalAmount.toFixed(2)},${collectionData.averageRate.toFixed(2)}`,
      `Dispatch,${dispatchData.totalRecords},${dispatchData.totalQuantity.toFixed(2)},${dispatchData.weightedFat.toFixed(2)},${dispatchData.weightedSnf.toFixed(2)},${dispatchData.weightedClr.toFixed(2)},${dispatchData.totalAmount.toFixed(2)},${dispatchData.averageRate.toFixed(2)}`,
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
    a.download = `collection-dispatch-comparison-${currentDate.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!collectionData || !dispatchData) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const logoPath = '/fulllogo.png';
    doc.addImage(logoPath, 'PNG', 14, 8, 0, 12);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Collection vs Dispatch Comparison - LactoConnect System', 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${currentDate.label} (${currentDate.from} to ${currentDate.to})`, 148.5, 21, { align: 'center' });

    // Get filter details
    const selectedDairy = dairyFilter.length > 0 ? dairies.find(d => d.id.toString() === dairyFilter[0]) : null;
    const selectedBmc = bmcFilter.length > 0 ? bmcs.find(b => b.id.toString() === bmcFilter[0]) : null;
    const selectedSociety = societyFilter.length > 0 ? societies.find(s => s.id.toString() === societyFilter[0]) : null;

    let startY = 28;

    // Add filter information
    if (selectedDairy || selectedBmc || selectedSociety) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Filters Applied:', 14, startY);
      doc.setFont('helvetica', 'normal');
      startY += 5;
      if (selectedDairy) {
        doc.text(`Dairy: ${selectedDairy.name} (${selectedDairy.dairyId})`, 14, startY);
        startY += 4;
      }
      if (selectedBmc) {
        doc.text(`BMC: ${selectedBmc.name} (${selectedBmc.bmcId})`, 14, startY);
        startY += 4;
      }
      if (selectedSociety) {
        doc.text(`Society: ${selectedSociety.name} (${selectedSociety.society_id})`, 14, startY);
        startY += 4;
      }
      startY += 2;
    }

    if (dailyCollectionData.length > 0 && dailyDispatchData.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DAY-BY-DAY BREAKDOWN', 148.5, startY, { align: 'center' });

      const dailyRows: any[] = [];
      dailyCollectionData.forEach((day, idx) => {
        const dispatchDay = dailyDispatchData[idx];
        dailyRows.push([day.date, 'Collection', day.data.totalRecords, day.data.totalQuantity.toFixed(2), day.data.weightedFat.toFixed(2), day.data.weightedSnf.toFixed(2), day.data.weightedClr.toFixed(2), day.data.totalAmount.toFixed(2), day.data.averageRate.toFixed(2)]);
        dailyRows.push(['', 'Dispatch', dispatchDay.data.totalRecords, dispatchDay.data.totalQuantity.toFixed(2), dispatchDay.data.weightedFat.toFixed(2), dispatchDay.data.weightedSnf.toFixed(2), dispatchDay.data.weightedClr.toFixed(2), dispatchDay.data.totalAmount.toFixed(2), dispatchDay.data.averageRate.toFixed(2)]);
        dailyRows.push(['', 'Difference', (day.data.totalRecords - dispatchDay.data.totalRecords).toFixed(0), (day.data.totalQuantity - dispatchDay.data.totalQuantity).toFixed(2), (day.data.weightedFat - dispatchDay.data.weightedFat).toFixed(2), (day.data.weightedSnf - dispatchDay.data.weightedSnf).toFixed(2), (day.data.weightedClr - dispatchDay.data.weightedClr).toFixed(2), (day.data.totalAmount - dispatchDay.data.totalAmount).toFixed(2), (day.data.averageRate - dispatchDay.data.averageRate).toFixed(2)]);
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
        ['Collection', collectionData.totalRecords, collectionData.totalQuantity.toFixed(2), collectionData.weightedFat.toFixed(2), collectionData.weightedSnf.toFixed(2), collectionData.weightedClr.toFixed(2), collectionData.totalAmount.toFixed(2), collectionData.averageRate.toFixed(2)],
        ['Dispatch', dispatchData.totalRecords, dispatchData.totalQuantity.toFixed(2), dispatchData.weightedFat.toFixed(2), dispatchData.weightedSnf.toFixed(2), dispatchData.weightedClr.toFixed(2), dispatchData.totalAmount.toFixed(2), dispatchData.averageRate.toFixed(2)]
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

    doc.save(`collection-dispatch-comparison-${currentDate.from}.pdf`);
  };

  const getDifference = (collection: number, dispatch: number) => {
    const diff = collection - dispatch;
    const percentChange = dispatch !== 0 ? ((diff / dispatch) * 100) : 0;
    return { diff, percentChange };
  };

  const renderDifferenceCell = (collection: number, dispatch: number, decimals: number = 2) => {
    const { diff, percentChange } = getDifference(collection, dispatch);
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {isPositive ? '+' : ''}{diff.toFixed(decimals)}
        </span>
        <div className="flex items-center gap-1">
          {isPositive && <TrendingUp className="w-3 h-3 text-green-600" />}
          {isNegative && <TrendingDown className="w-3 h-3 text-red-600" />}
          {!isPositive && !isNegative && <Minus className="w-3 h-3 text-gray-400" />}
          <span className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <FlowerSpinner size={48} />
        </div>
      </div>
    );
  }

  if (!collectionData || !dispatchData) {
    console.log('❌ NO COMPARISON DATA AVAILABLE');
    console.log('collectionData:', collectionData);
    console.log('dispatchData:', dispatchData);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-center text-gray-500">No data available for comparison</p>
      </div>
    );
  }

  console.log('✅ RENDERING COLLECTION VS DISPATCH COMPARISON');
  console.log('Collection Data:', JSON.stringify(collectionData, null, 2));
  console.log('Dispatch Data:', JSON.stringify(dispatchData, null, 2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Collection vs Dispatch Comparison Report
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comparing Collection and Dispatch data for {currentDate.label} ({currentDate.from} to {currentDate.to})
            </p>
          </div>
          
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
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dairy Filter Dropdown */}
          {onDairyChange && dairies.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dairy:
              </label>
              <select
                value={dairyFilter.length > 0 ? dairyFilter[0] : ''}
                onChange={(e) => {
                  onDairyChange(e.target.value ? [e.target.value] : []);
                  if (onBmcChange) onBmcChange([]);
                  if (onSocietyChange) onSocietyChange([]);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Dairies</option>
                {dairies.map((dairy) => (
                  <option key={dairy.id} value={dairy.id.toString()}>
                    {dairy.name} ({dairy.dairyId})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* BMC Filter Dropdown */}
          {onBmcChange && bmcs.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BMC:
              </label>
              <select
                value={bmcFilter.length > 0 ? bmcFilter[0] : ''}
                onChange={(e) => {
                  onBmcChange(e.target.value ? [e.target.value] : []);
                  if (onSocietyChange) onSocietyChange([]);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">BMCs</option>
                {bmcs
                  .filter(bmc => {
                    if (dairyFilter.length > 0) {
                      const selectedDairyId = parseInt(dairyFilter[0]);
                      return bmc.dairyFarmId === selectedDairyId;
                    }
                    return true;
                  })
                  .map((bmc) => (
                    <option key={bmc.id} value={bmc.id.toString()}>
                      {bmc.name} ({bmc.bmcId})
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          {/* Society Filter Dropdown */}
          {onSocietyChange && societies.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Society:
              </label>
              <select
                value={societyFilter.length > 0 ? societyFilter[0] : ''}
                onChange={(e) => onSocietyChange(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Societies</option>
                {societies
                  .filter(society => {
                    if (bmcFilter.length > 0) {
                      const selectedBmcId = parseInt(bmcFilter[0]);
                      return society.bmc_id === selectedBmcId;
                    }
                    if (dairyFilter.length > 0) {
                      const selectedDairyId = parseInt(dairyFilter[0]);
                      const dairyBmcIds = bmcs
                        .filter(bmc => bmc.dairyFarmId === selectedDairyId)
                        .map(bmc => bmc.id);
                      return society.bmc_id && dairyBmcIds.includes(society.bmc_id);
                    }
                    return true;
                  })
                  .map((society) => (
                    <option key={society.id} value={society.id.toString()}>
                      {society.name} ({society.society_id})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        {dailyCollectionData.length > 0 && dailyDispatchData.length > 0 ? (
          // Day-by-day table
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/40 dark:to-cyan-900/40">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Date</th>
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
              {dailyCollectionData.map((day, index) => {
                const dispatchDay = dailyDispatchData[index];
                return (
                  <React.Fragment key={day.date}>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td rowSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                          {day.date}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-blue-700 dark:text-blue-300 border border-gray-300 dark:border-gray-600">Collection</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{day.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{day.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{day.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{day.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{day.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{day.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{day.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-green-50 dark:bg-green-900/20">
                      <td className="px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-300 border border-gray-300 dark:border-gray-600">Dispatch</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold">{dispatchDay.data.totalRecords}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-emerald-600 dark:text-emerald-300">{dispatchDay.data.totalQuantity.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-amber-600 dark:text-amber-300">{dispatchDay.data.weightedFat.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-purple-600 dark:text-purple-300">{dispatchDay.data.weightedSnf.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-pink-600 dark:text-pink-300">{dispatchDay.data.weightedClr.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-blue-600 dark:text-blue-300">₹{dispatchDay.data.totalAmount.toFixed(2)}</span></td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"><span className="font-semibold text-cyan-600 dark:text-cyan-300">₹{dispatchDay.data.averageRate.toFixed(2)}</span></td>
                    </tr>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Difference</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalRecords, dispatchDay.data.totalRecords, 0)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalQuantity, dispatchDay.data.totalQuantity)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedFat, dispatchDay.data.weightedFat)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedSnf, dispatchDay.data.weightedSnf)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.weightedClr, dispatchDay.data.weightedClr)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.totalAmount, dispatchDay.data.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">{renderDifferenceCell(day.data.averageRate, dispatchDay.data.averageRate)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/50 dark:to-cyan-900/50 font-bold">
                <td colSpan={2} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">Total / Average</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">C: {collectionData.totalRecords} / D: {dispatchData.totalRecords}</td>
                <td className="px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-200 border border-gray-300 dark:border-gray-600">C: {collectionData.totalQuantity.toFixed(2)} / D: {dispatchData.totalQuantity.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-200 border border-gray-300 dark:border-gray-600">C: {collectionData.weightedFat.toFixed(2)} / D: {dispatchData.weightedFat.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-purple-700 dark:text-purple-200 border border-gray-300 dark:border-gray-600">C: {collectionData.weightedSnf.toFixed(2)} / D: {dispatchData.weightedSnf.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-pink-700 dark:text-pink-200 border border-gray-300 dark:border-gray-600">C: {collectionData.weightedClr.toFixed(2)} / D: {dispatchData.weightedClr.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-blue-700 dark:text-blue-200 border border-gray-300 dark:border-gray-600">C: ₹{collectionData.totalAmount.toFixed(2)} / D: ₹{dispatchData.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-sm text-cyan-700 dark:text-cyan-200 border border-gray-300 dark:border-gray-600">C: ₹{collectionData.averageRate.toFixed(2)} / D: ₹{dispatchData.averageRate.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          // Original comparison table
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
            {/* Collection Row */}
            <tr className="bg-blue-50 dark:bg-blue-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Collection
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.totalRecords}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{collectionData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{collectionData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{collectionData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Dispatch Row */}
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Dispatch
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.totalRecords}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.totalQuantity.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedFat.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedSnf.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">{dispatchData.weightedClr.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{dispatchData.totalAmount.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                <span className="font-semibold">₹{dispatchData.averageRate.toFixed(2)}</span>
              </td>
            </tr>

            {/* Difference Row */}
            <tr className="bg-yellow-50 dark:bg-yellow-900/20">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                Difference (Collection - Dispatch)
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalRecords, dispatchData.totalRecords, 0)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalQuantity, dispatchData.totalQuantity)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedFat, dispatchData.weightedFat)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedSnf, dispatchData.weightedSnf)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.weightedClr, dispatchData.weightedClr)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.totalAmount, dispatchData.totalAmount)}
              </td>
              <td className="px-4 py-3 text-center text-sm border border-gray-300 dark:border-gray-600">
                {renderDifferenceCell(collectionData.averageRate, dispatchData.averageRate)}
              </td>
            </tr>
          </tbody>
          </table>
        )}
      </div>

      {/* Note */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This comparison shows weighted average values for Collection vs Dispatch in the selected time period.
          Positive differences mean Collection values are higher, negative differences mean Dispatch values are higher.
        </p>
      </div>

      {/* Comparison Chart - Hide when daily data is available */}
      {dailyCollectionData.length === 0 && dailyDispatchData.length === 0 && (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Distribution Chart — Comparison Analysis</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Radar visualization showing all parameters normalized to 0-100 scale</p>
        
        {(() => {
          const normalize = (value: number, min: number, max: number) => {
            if (max === min) return 50;
            return ((value - min) / (max - min)) * 100;
          };

          const qtyMin = Math.min(collectionData.totalQuantity, dispatchData.totalQuantity) * 0.9;
          const qtyMax = Math.max(collectionData.totalQuantity, dispatchData.totalQuantity) * 1.1;
          const amtMin = Math.min(collectionData.totalAmount, dispatchData.totalAmount) * 0.9;
          const amtMax = Math.max(collectionData.totalAmount, dispatchData.totalAmount) * 1.1;
          const fatMin = Math.min(collectionData.weightedFat, dispatchData.weightedFat) * 0.9;
          const fatMax = Math.max(collectionData.weightedFat, dispatchData.weightedFat) * 1.1;
          const snfMin = Math.min(collectionData.weightedSnf, dispatchData.weightedSnf) * 0.9;
          const snfMax = Math.max(collectionData.weightedSnf, dispatchData.weightedSnf) * 1.1;
          const clrMin = Math.min(collectionData.weightedClr, dispatchData.weightedClr) * 0.9;
          const clrMax = Math.max(collectionData.weightedClr, dispatchData.weightedClr) * 1.1;
          const rateMin = Math.min(collectionData.averageRate, dispatchData.averageRate) * 0.9;
          const rateMax = Math.max(collectionData.averageRate, dispatchData.averageRate) * 1.1;

          const collectionNormalized = [
            { parameter: 'Quantity', value: normalize(collectionData.totalQuantity, qtyMin, qtyMax), actual: collectionData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', value: normalize(collectionData.totalAmount, amtMin, amtMax), actual: collectionData.totalAmount, unit: '₹' },
            { parameter: 'FAT %', value: normalize(collectionData.weightedFat, fatMin, fatMax), actual: collectionData.weightedFat, unit: '%' },
            { parameter: 'SNF %', value: normalize(collectionData.weightedSnf, snfMin, snfMax), actual: collectionData.weightedSnf, unit: '%' },
            { parameter: 'CLR', value: normalize(collectionData.weightedClr, clrMin, clrMax), actual: collectionData.weightedClr, unit: '' },
            { parameter: 'Rate', value: normalize(collectionData.averageRate, rateMin, rateMax), actual: collectionData.averageRate, unit: '₹/L' }
          ];

          const dispatchNormalized = [
            { parameter: 'Quantity', value: normalize(dispatchData.totalQuantity, qtyMin, qtyMax), actual: dispatchData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', value: normalize(dispatchData.totalAmount, amtMin, amtMax), actual: dispatchData.totalAmount, unit: '₹' },
            { parameter: 'FAT %', value: normalize(dispatchData.weightedFat, fatMin, fatMax), actual: dispatchData.weightedFat, unit: '%' },
            { parameter: 'SNF %', value: normalize(dispatchData.weightedSnf, snfMin, snfMax), actual: dispatchData.weightedSnf, unit: '%' },
            { parameter: 'CLR', value: normalize(dispatchData.weightedClr, clrMin, clrMax), actual: dispatchData.weightedClr, unit: '' },
            { parameter: 'Rate', value: normalize(dispatchData.averageRate, rateMin, rateMax), actual: dispatchData.averageRate, unit: '₹/L' }
          ];

          const combinedData = [
            { parameter: 'Quantity', collection: normalize(collectionData.totalQuantity, qtyMin, qtyMax), dispatch: normalize(dispatchData.totalQuantity, qtyMin, qtyMax), collActual: collectionData.totalQuantity, dispActual: dispatchData.totalQuantity, unit: 'L' },
            { parameter: 'Amount', collection: normalize(collectionData.totalAmount, amtMin, amtMax), dispatch: normalize(dispatchData.totalAmount, amtMin, amtMax), collActual: collectionData.totalAmount, dispActual: dispatchData.totalAmount, unit: '₹' },
            { parameter: 'FAT %', collection: normalize(collectionData.weightedFat, fatMin, fatMax), dispatch: normalize(dispatchData.weightedFat, fatMin, fatMax), collActual: collectionData.weightedFat, dispActual: dispatchData.weightedFat, unit: '%' },
            { parameter: 'SNF %', collection: normalize(collectionData.weightedSnf, snfMin, snfMax), dispatch: normalize(dispatchData.weightedSnf, snfMin, snfMax), collActual: collectionData.weightedSnf, dispActual: dispatchData.weightedSnf, unit: '%' },
            { parameter: 'CLR', collection: normalize(collectionData.weightedClr, clrMin, clrMax), dispatch: normalize(dispatchData.weightedClr, clrMin, clrMax), collActual: collectionData.weightedClr, dispActual: dispatchData.weightedClr, unit: '' },
            { parameter: 'Rate', collection: normalize(collectionData.averageRate, rateMin, rateMax), dispatch: normalize(dispatchData.averageRate, rateMin, rateMax), collActual: collectionData.averageRate, dispActual: dispatchData.averageRate, unit: '₹/L' }
          ];

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Collection</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={collectionNormalized}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Collection" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
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
                    <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{collectionData.totalQuantity.toFixed(2)} L</span></div>
                    <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{collectionData.totalAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{collectionData.weightedFat.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{collectionData.weightedSnf.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{collectionData.weightedClr.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{collectionData.averageRate.toFixed(2)}/L</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Dispatch</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={dispatchNormalized}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Dispatch" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} strokeWidth={2} />
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
                    <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold">{dispatchData.totalQuantity.toFixed(2)} L</span></div>
                    <div className="flex justify-between"><span>Amount:</span><span className="font-semibold">₹{dispatchData.totalAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>FAT:</span><span className="font-semibold">{dispatchData.weightedFat.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span>SNF:</span><span className="font-semibold">{dispatchData.weightedSnf.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span>CLR:</span><span className="font-semibold">{dispatchData.weightedClr.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Rate:</span><span className="font-semibold">₹{dispatchData.averageRate.toFixed(2)}/L</span></div>
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
                    <Radar name="Collection" dataKey="collection" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2.5} />
                    <Radar name="Dispatch" dataKey="dispatch" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2.5} />
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
                        const actual = name === 'Collection' ? props.payload.collActual : props.payload.dispActual;
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

      {/* Daily Variations Chart */}
      {dailyCollectionData.length > 0 && dailyDispatchData.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Daily Variations - Collection vs Dispatch</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Normalized trends from {currentDate.from} to {currentDate.to}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-xs font-semibold shadow-lg">
              0-100 Scale
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={dailyCollectionData.map((d, idx) => {
                const allCollQty = dailyCollectionData.map(day => day.data.totalQuantity);
                const allDispQty = dailyDispatchData.map(day => day.data.totalQuantity);
                const allCollAmt = dailyCollectionData.map(day => day.data.totalAmount);
                const allDispAmt = dailyDispatchData.map(day => day.data.totalAmount);
                const allCollFat = dailyCollectionData.map(day => day.data.weightedFat);
                const allDispFat = dailyDispatchData.map(day => day.data.weightedFat);
                const allCollSnf = dailyCollectionData.map(day => day.data.weightedSnf);
                const allDispSnf = dailyDispatchData.map(day => day.data.weightedSnf);
                const allCollClr = dailyCollectionData.map(day => day.data.weightedClr);
                const allDispClr = dailyDispatchData.map(day => day.data.weightedClr);

                const normalize = (value: number, values: number[]) => {
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  if (max === min) return 50;
                  return ((value - min) / (max - min)) * 100;
                };

                return {
                  date: d.date.split('-').slice(1).join('/'),
                  'Collection Qty': normalize(d.data.totalQuantity, allCollQty),
                  'Dispatch Qty': normalize(dailyDispatchData[idx].data.totalQuantity, allDispQty),
                  'Collection Amt': normalize(d.data.totalAmount, allCollAmt),
                  'Dispatch Amt': normalize(dailyDispatchData[idx].data.totalAmount, allDispAmt),
                  'Collection FAT': normalize(d.data.weightedFat, allCollFat),
                  'Dispatch FAT': normalize(dailyDispatchData[idx].data.weightedFat, allDispFat),
                  'Collection SNF': normalize(d.data.weightedSnf, allCollSnf),
                  'Dispatch SNF': normalize(dailyDispatchData[idx].data.weightedSnf, allDispSnf),
                  'Collection CLR': normalize(d.data.weightedClr, allCollClr),
                  'Dispatch CLR': normalize(dailyDispatchData[idx].data.weightedClr, allDispClr),
                  collQtyActual: d.data.totalQuantity,
                  dispQtyActual: dailyDispatchData[idx].data.totalQuantity,
                  collAmtActual: d.data.totalAmount,
                  dispAmtActual: dailyDispatchData[idx].data.totalAmount,
                  collFatActual: d.data.weightedFat,
                  dispFatActual: dailyDispatchData[idx].data.weightedFat,
                  collSnfActual: d.data.weightedSnf,
                  dispSnfActual: dailyDispatchData[idx].data.weightedSnf,
                  collClrActual: d.data.weightedClr,
                  dispClrActual: dailyDispatchData[idx].data.weightedClr
                };
              })} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorCollQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDispQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCollAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDispAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCollFAT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDispFAT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCollSNF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDispSNF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCollCLR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDispCLR" x1="0" y1="0" x2="0" y2="1">
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
                    if (name === 'Collection Qty') return [`${payload.collQtyActual.toFixed(2)} L`, name];
                    if (name === 'Dispatch Qty') return [`${payload.dispQtyActual.toFixed(2)} L`, name];
                    if (name === 'Collection Amt') return [`₹${payload.collAmtActual.toFixed(2)}`, name];
                    if (name === 'Dispatch Amt') return [`₹${payload.dispAmtActual.toFixed(2)}`, name];
                    if (name === 'Collection FAT') return [`${payload.collFatActual.toFixed(2)}%`, name];
                    if (name === 'Dispatch FAT') return [`${payload.dispFatActual.toFixed(2)}%`, name];
                    if (name === 'Collection SNF') return [`${payload.collSnfActual.toFixed(2)}%`, name];
                    if (name === 'Dispatch SNF') return [`${payload.dispSnfActual.toFixed(2)}%`, name];
                    if (name === 'Collection CLR') return [`${payload.collClrActual.toFixed(2)}`, name];
                    if (name === 'Dispatch CLR') return [`${payload.dispClrActual.toFixed(2)}`, name];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Area 
                  type="monotone" 
                  dataKey="Collection Qty" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fill="url(#colorCollQty)"
                />
                <Area 
                  type="monotone" 
                  dataKey="Dispatch Qty" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fill="url(#colorDispQty)"
                />
                <Area 
                  type="monotone" 
                  dataKey="Collection Amt" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fill="url(#colorCollAmt)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Dispatch Amt" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fill="url(#colorDispAmt)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Collection FAT" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fill="url(#colorCollFAT)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Dispatch FAT" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fill="url(#colorDispFAT)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Collection SNF" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  fill="url(#colorCollSNF)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Dispatch SNF" 
                  stroke="#84cc16" 
                  strokeWidth={2}
                  fill="url(#colorDispSNF)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Collection CLR" 
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  fill="url(#colorCollCLR)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="Dispatch CLR" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  fill="url(#colorDispCLR)"
                  fillOpacity={0.6}
                />
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

              const collQtyRange = getRange(dailyCollectionData.map(d => d.data.totalQuantity));
              const dispQtyRange = getRange(dailyDispatchData.map(d => d.data.totalQuantity));
              const collAmtRange = getRange(dailyCollectionData.map(d => d.data.totalAmount));
              const dispAmtRange = getRange(dailyDispatchData.map(d => d.data.totalAmount));
              const collFatRange = getRange(dailyCollectionData.map(d => d.data.weightedFat));
              const dispFatRange = getRange(dailyDispatchData.map(d => d.data.weightedFat));
              const collSnfRange = getRange(dailyCollectionData.map(d => d.data.weightedSnf));
              const dispSnfRange = getRange(dailyDispatchData.map(d => d.data.weightedSnf));
              const collClrRange = getRange(dailyCollectionData.map(d => d.data.weightedClr));
              const dispClrRange = getRange(dailyDispatchData.map(d => d.data.weightedClr));

              return (
                <>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Coll Qty: {collQtyRange.min.toFixed(0)}-{collQtyRange.max.toFixed(0)}L
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Disp Qty: {dispQtyRange.min.toFixed(0)}-{dispQtyRange.max.toFixed(0)}L
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Coll Amt: ₹{collAmtRange.min.toFixed(0)}-₹{collAmtRange.max.toFixed(0)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Disp Amt: ₹{dispAmtRange.min.toFixed(0)}-₹{dispAmtRange.max.toFixed(0)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    Coll FAT: {collFatRange.min.toFixed(1)}-{collFatRange.max.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Disp FAT: {dispFatRange.min.toFixed(1)}-{dispFatRange.max.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Coll SNF: {collSnfRange.min.toFixed(1)}-{collSnfRange.max.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                    Disp SNF: {dispSnfRange.min.toFixed(1)}-{dispSnfRange.max.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Coll CLR: {collClrRange.min.toFixed(1)}-{collClrRange.max.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    Disp CLR: {dispClrRange.min.toFixed(1)}-{dispClrRange.max.toFixed(1)}
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
