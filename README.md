# Stock Advisor

A real-time stock price tracking application built with Next.js and TypeScript. This application allows users to:

- Search for stocks using their ticker symbols
- View interactive price charts with multiple time ranges
- Track historical stock data from 1 day to 5 years
- Switch between light and dark themes automatically

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Charting**: Chart.js with react-chartjs-2
- **Styling**: CSS Modules with dark/light theme support
- **Icons**: React Icons
- **HTTP Client**: Axios
- **API**: Alpha Vantage Stock API

## Features

- **Real-time Stock Data**: Fetch and display current stock prices
- **Interactive Charts**: Visualize stock price trends with customizable time ranges
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Server Components**: Optimized performance with Next.js server components
- **Client-side Navigation**: Smooth transitions between pages
- **Error Handling**: Comprehensive error states and loading indicators

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── stock-price/    # Stock price route
│   ├── components/         # React components
│   │   └── Header.tsx      # Navigation header
│   └── styles/            # Global styles
└── public/                # Static assets
```

## Usage

1. Enter a stock symbol (e.g., AAPL, GOOGL) in the search bar
2. Press Enter to view the stock's price chart
3. Use the time range buttons to adjust the chart's time period
4. Click the home icon to return to the dashboard

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint