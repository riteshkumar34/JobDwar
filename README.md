# Job Listings Platform

A modern, responsive job listings platform built with React, Vite, Tailwind CSS, shadcn/ui, and Framer Motion. Features advanced search and filtering, smooth animations, and seamless CSV data integration from Google Sheets.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.10-blue.svg)

## ✨ Features

- **🔍 Advanced Search & Filtering**: Search by keywords, filter by location, job type, experience level, salary range, and tags
- **📱 Responsive Design**: Mobile-first design that works beautifully on all devices
- **🎨 Modern UI**: Clean, accessible interface using shadcn/ui components
- **✨ Smooth Animations**: Framer Motion powered animations with reduced-motion support
- **📊 CSV Integration**: Direct integration with Google Sheets published CSV data
- **🔗 URL State Management**: Shareable URLs with filter state preservation
- **♿ Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **⚡ Performance**: Optimized loading, search, and filtering with code splitting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git (for version control and deployment)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/job-listings.git
cd job-listings
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your Google Sheets CSV URL:
```env
VITE_JOBS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv
```

4. **Start development server:**
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application.

## 📊 CSV Schema & Google Sheets Setup

### Required CSV Columns

The application expects a CSV with the following columns (header names are flexible):

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | No | Unique identifier (auto-generated if missing) |
| `title` | string | Yes | Job title/position |
| `company` | string | Yes | Company name |
| `location` | string | No | Job location |
| `type` | string | No | Full-time, Part-time, Contract, Freelance, Internship |
| `level` | string | No | Entry, Junior, Mid, Senior, Lead, Principal, Director |
| `salary_min` | number | No | Minimum salary |
| `salary_max` | number | No | Maximum salary |
| `tags` | string | No | Comma-separated skills/technologies |
| `posted_at` | string | No | Date posted (ISO format preferred) |
| `apply_url` | string | No | Application URL |
| `description` | string | No | Job description |
| `benefits` | string | No | Benefits offered |
| `requirements` | string | No | Job requirements |
| `company_logo` | string | No | Company logo URL |
| `company_website` | string | No | Company website URL |
| `remote_friendly` | boolean | No | Remote work allowed |
| `featured` | boolean | No | Featured job posting |

### Setting up Google Sheets

1. **Create your Google Sheet** with job data using the schema above
2. **Publish to web:**
   - Go to File → Share → Publish to web
   - Choose "Entire Document" and "Comma-separated values (.csv)"
   - Click "Publish" and copy the generated URL
3. **Add URL to environment:**
   - Paste the URL in your `.env` file as `VITE_JOBS_CSV_URL`

### Sample Data

The application includes sample data in `public/sample-jobs.csv` as a fallback. You can use this as a template for your own data.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set environment variables** in Vercel dashboard:
   - `VITE_JOBS_CSV_URL`: Your Google Sheets CSV URL

### Netlify

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your Git repository

3. **Configure environment variables** in Netlify dashboard

### GitHub Pages

The repository includes a GitHub Actions workflow for automatic deployment:

1. **Enable GitHub Pages** in repository settings
2. **Set source** to "GitHub Actions"
3. **Add secrets** in repository settings:
   - `VITE_JOBS_CSV_URL`: Your CSV URL

## ♿ Accessibility

The application follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard operability
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: Meets AA contrast requirements
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects `prefers-reduced-motion`

## 🧪 Testing Checklist

- [ ] **Data Loading**: CSV loads successfully from both remote URL and fallback
- [ ] **Search**: Text search works across all job fields
- [ ] **Filters**: All filter options work correctly
- [ ] **Sorting**: Jobs sort by different criteria
- [ ] **Responsive**: Layout adapts to different screen sizes
- [ ] **Accessibility**: Keyboard navigation and screen reader support
- [ ] **Performance**: Smooth animations and fast search
- [ ] **URL State**: Filters persist in URL and on refresh

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Required: Google Sheets CSV URL
VITE_JOBS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv

# Optional: Analytics
VITE_GA_ID=G-XXXXXXXXXX

# Optional: Environment
VITE_APP_ENV=production
```

## 🏆 Future Enhancements

- [ ] Advanced search with boolean operators
- [ ] Job bookmarking with localStorage
- [ ] Email job alerts
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Advanced analytics integration
- [ ] Employer dashboard
- [ ] Application tracking

## 📄 License

This project is licensed under the MIT License.
