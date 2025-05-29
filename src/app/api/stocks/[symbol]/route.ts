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
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.data || response.data['Error Message']) {
      return NextResponse.json(
        { error: 'Invalid stock symbol or API error' },
        { status: 400 }
      );
    }

    if (response.data.Note?.includes('API call frequency')) {
      return NextResponse.json(
        { error: 'API rate limit reached' },
        { status: 429 }
      );
    }

    // Cache the successful response
    await redis.setex(cacheKey, CACHE_DURATION, response.data);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
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