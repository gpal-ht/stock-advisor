'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = '5y' | '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

const timeRangeButtons: { value: TimeRange; label: string }[] = [
  { value: '5y', label: '5Y' },
  { value: '1y', label: '1Y' },
  { value: '6m', label: '6M' },
  { value: '3m', label: '3M' },
  { value: '1m', label: '1M' },
  { value: '1w', label: '1W' },
  { value: '1d', label: '1D' }
];

export default function StockPrice({ params }: { params: { symbol: string } }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [stockData, setStockData] = useState<{ dates: string[], prices: number[] }>({ dates: [], prices: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { symbol } = params;

  const formatDate = (date: string, range: TimeRange) => {
    if (range === '1d') {
      return date.substring(11, 16);
    }
    const [year, month, day] = date.substring(0, 10).split('-');
    if (range === '5y' || range === '1y') {
      return `${month}/${year}`;
    }
    return `${month}/${day}/${year.substring(2)}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getDataKey = (range: TimeRange) => {
    switch (range) {
      case '1d':
        return 'Time Series (5min)';
      case '1w':
      case '1m':
      case '3m':
        return 'Time Series (Daily)';
      default:
        return 'Monthly Time Series';
    }
  };

  const getDataLimit = (range: TimeRange) => {
    switch (range) {
      case '1d': return 78;
      case '1w': return 5;
      case '1m': return 21;
      case '3m': return 63;
      case '6m': return 6;
      case '1y': return 12;
      case '5y': return 60;
      default: return 12;
    }
  };

  const fetchStockData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    setStockData({ dates: [], prices: [] });
    
    try {
      const response = await fetch(`/api/stocks/${symbol}?timeRange=${timeRange}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock data');
      }

      if (data.Note?.includes('API call frequency')) {
        throw new Error('API rate limit reached. Please try again in a minute.');
      }

      const dataKey = getDataKey(timeRange);
      const timeSeries = data[dataKey];
      
      if (!timeSeries) {
        throw new Error(`No data available for ${symbol}. The symbol might be invalid or the market might be closed.`);
      }

      const timeSeriesEntries = Object.entries(timeSeries);
      if (timeSeriesEntries.length === 0) {
        throw new Error(`No price data available for ${symbol} in the selected time range.`);
      }

      const dates: string[] = [];
      const prices: number[] = [];

      timeSeriesEntries
        .slice(0, getDataLimit(timeRange))
        .reverse()
        .forEach(([date, values]: [string, any]) => {
          if (values['4. close']) {
            dates.push(formatDate(date, timeRange));
            prices.push(parseFloat(values['4. close']));
          }
        });

      if (dates.length === 0 || prices.length === 0) {
        throw new Error(`No valid price data found for ${symbol}.`);
      }

      setStockData({ dates, prices });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data. Please try again.');
      console.error('Stock API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol, timeRange]);

  const chartData = {
    labels: stockData.dates,
    datasets: [
      {
        label: `${symbol.toUpperCase()} Stock Price`,
        data: stockData.prices,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${symbol.toUpperCase()} Stock Price History`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return formatPrice(context.parsed.y);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: (value: number) => formatPrice(value),
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="container">
      {error && (
        <p className="error" style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
          {error}
        </p>
      )}
      
      <div className="chart-container">
        <div className="time-range-buttons">
          {timeRangeButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`time-range-button ${timeRange === value ? 'active' : ''}`}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : (
          <Line data={chartData} options={chartOptions} height={400} />
        )}
      </div>
    </div>
  );
}