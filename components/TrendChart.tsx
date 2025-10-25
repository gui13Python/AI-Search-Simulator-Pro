
import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { subDays, subMonths, subYears, parseISO } from 'date-fns';

import type { TrendDataPoint } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TrendChartProps {
  data: TrendDataPoint[];
  t: (key: string) => string;
}

type FilterType = '5Y' | '1Y' | '30D' | 'CUSTOM';

const TrendChart: React.FC<TrendChartProps> = ({ data, t }) => {
  const [filter, setFilter] = useState<FilterType>('5Y');
  const [customRange, setCustomRange] = useState({
      start: '',
      end: ''
  });

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case '1Y':
        startDate = subYears(now, 1);
        break;
      case '30D':
        startDate = subDays(now, 30);
        break;
      case 'CUSTOM':
          if (customRange.start && customRange.end) {
              const customStartDate = parseISO(customRange.start);
              const customEndDate = parseISO(customRange.end);
              return data.filter(d => {
                  const pointDate = parseISO(d.date);
                  return pointDate >= customStartDate && pointDate <= customEndDate;
              });
          }
          return []; // Return empty if custom range is not fully set
      case '5Y':
      default:
        startDate = subYears(now, 5);
        break;
    }
     return data.filter(d => {
        try {
            return parseISO(d.date) >= startDate;
        } catch (e) {
            console.warn(`Invalid date format for point:`, d);
            return false;
        }
     });
  }, [data, filter, customRange]);
  
  const chartData = {
    labels: filteredData.map(d => d.date),
    datasets: [
      {
        label: t('trendChart.volumeAxisLabel'),
        data: filteredData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('trendChart.title'),
        font: {
            size: 16
        }
      },
    },
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'month' as const,
            },
            ticks: {
                maxRotation: 45,
                minRotation: 45,
            }
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: t('trendChart.volumeAxisLabel')
            }
        }
    }
  };

  const FilterButton: React.FC<{
    label: string;
    value: FilterType;
  }> = ({ label, value }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
        filter === value
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterButton label={t('trendChart.filter5Y')} value="5Y" />
        <FilterButton label={t('trendChart.filter1Y')} value="1Y" />
        <FilterButton label={t('trendChart.filter30D')} value="30D" />
        <FilterButton label={t('trendChart.filterCustom')} value="CUSTOM" />
      </div>
      {filter === 'CUSTOM' && (
          <div className="flex items-center gap-2 text-sm">
            <input 
              type="date" 
              value={customRange.start}
              onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))}
              className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            />
            <span>-</span>
            <input 
              type="date" 
              value={customRange.end}
              onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))}
              className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            />
          </div>
      )}
      <div className="relative h-64 md:h-80">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default TrendChart;
