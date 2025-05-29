import { NextResponse } from 'next/server';
import axios from 'axios';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const CACHE_DURATION = 2 * 24 * 60 * 60; // 2 days in seconds

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const searchParams = new URL(request.url).searchParams;
  const timeRange = searchParams.get('timeRange') || '1y';
  
  try {
    // Try to get cached data first
    const cacheKey = `stock_${symbol}_${timeRange}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const apiFunction = getApiFunction(timeRange);
    
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      return NextResponse.json(
        { error: 'Alpha Vantage API key is not configured' },
        { status: 500 }
      );
    }

    const apiUrl = `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    
    const response = await axios.get(apiUrl, {
      validateStatus: (status) => true, // Allow any status code for better error handling
      headers: {
        'Accept': 'application/json'
      }
    });

    // Log response details for debugging
    console.log('Alpha Vantage API Response:', {
      status: response.status,
      contentType: response.headers['content-type'],
      isHtml: response.headers['content-type']?.includes('text/html'),
      hasErrorMessage: !!response.data['Error Message'],
      hasNote: !!response.data.Note
    });

    // Check for HTML response (invalid API key symptom)
    if (response.headers['content-type']?.includes('text/html')) {
      return NextResponse.json(
        { error: 'Invalid or expired Alpha Vantage API key. Please check your API key configuration.' },
        { status: 401 }
      );
    }

    if (!response.data) {
      return NextResponse.json(
        { error: 'Empty response from Alpha Vantage API' },
        { status: 502 }
      );
    }

    if (response.data['Error Message']) {
      return NextResponse.json(
        { error: response.data['Error Message'] },
        { status: 400 }
      );
    }

    if (response.data.Note?.includes('API call frequency')) {
      return NextResponse.json(
        { error: 'API rate limit reached. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Validate the response structure
    const dataKey = getDataKey(timeRange);
    if (!response.data[dataKey]) {
      return NextResponse.json(
        { error: `No data available for ${symbol}. The symbol might be invalid or the market might be closed.` },
        { status: 404 }
      );
    }

    // Cache the successful response
    await redis.setex(cacheKey, CACHE_DURATION, response.data);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Stock API Error:', {
      message: error.message,
      status: error.response?.status,
      contentType: error.response?.headers?.['content-type'],
      data: error.response?.data
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch stock data. Please check your API key and try again.' },
      { status: error.response?.status || 500 }
    );
  }
}

function getApiFunction(timeRange: string) {
  switch (timeRange) {
    case '1d':
      return 'TIME_SERIES_INTRADAY&interval=5min';
    case '1w':
    case '1m':
    case '3m':
      return 'TIME_SERIES_DAILY';
    default:
      return 'TIME_SERIES_MONTHLY';
  }
}

function getDataKey(timeRange: string) {
  switch (timeRange) {
    case '1d':
      return 'Time Series (5min)';
    case '1w':
    case '1m':
    case '3m':
      return 'Time Series (Daily)';
    default:
      return 'Monthly Time Series';
  }
}