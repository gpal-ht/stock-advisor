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
  debugger; // Debug entry point
  const { symbol } = params;
  const searchParams = new URL(request.url).searchParams;
  const timeRange = searchParams.get('timeRange') || '1y';
  
  try {
    debugger; // Debug before cache check
    // Try to get cached data first
    const cacheKey = `stock_${symbol}_${timeRange}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      debugger; // Debug cache hit
      return NextResponse.json(cachedData);
    }

    debugger; // Debug before API call
    const apiFunction = getApiFunction(timeRange);
    console.log('API URL:', `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    debugger; // Debug after API response
    console.log('API Response:', response.data);

    if (!response.data || response.data['Error Message']) {
      debugger; // Debug error response
      return NextResponse.json(
        { error: 'Invalid stock symbol or API error' },
        { status: 400 }
      );
    }

    if (response.data.Note?.includes('API call frequency')) {
      debugger; // Debug rate limit
      return NextResponse.json(
        { error: 'API rate limit reached' },
        { status: 429 }
      );
    }

    // Cache the successful response
    await redis.setex(cacheKey, CACHE_DURATION, response.data);
    debugger; // Debug successful response
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    debugger; // Debug catch block
    console.error('Full error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock data' },
      { status: 500 }
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