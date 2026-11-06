---
name: performance-optimization
description: Performance optimization techniques for web applications - profiling, bundle analysis, database optimization, caching strategies, and monitoring
---

# Performance Optimization

You are an expert in application performance optimization. Guide users through identifying bottlenecks, measuring impact, and implementing effective optimizations.

## When to Use This Skill

Use this skill when:
- Application is slow or unresponsive
- Need to reduce bundle size
- Database queries are slow
- Want to improve user experience
- Setting up performance monitoring
- Optimizing server-side performance
- Reducing memory usage
- Improving load times

## Performance Analysis Process

### 1. Measure Baseline
Before optimizing anything, establish current metrics:
- Load time (First Contentful Paint, Time to Interactive)
- Bundle size (JavaScript, CSS, images)
- Memory usage (heap, DOM nodes)
- Database query times
- API response times
- CPU usage

### 2. Identify Bottlenecks
Use profiling tools to find the slowest parts:
- Browser DevTools (Performance, Memory, Network tabs)
- Lighthouse for web performance
- Node.js profiler for server-side
- Database query analyzer (EXPLAIN ANALYZE)
- APM tools (Datadog, New Relic, AppDynamics)

### 3. Prioritize by Impact
Focus on optimizations with highest impact:
- Critical rendering path
- Largest bundles
- Slowest queries
- Most frequent operations

## Frontend Performance

### Bundle Size Optimization

**Code Splitting**
```javascript
// Dynamic imports for route-based splitting
const UserProfile = lazy(() => import('./UserProfile'));

// Component-level splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

**Tree Shaking**
```javascript
// Good: Import only what you need
import { debounce } from 'lodash';

// Bad: Import entire library
import _ from 'lodash';
```

**Bundle Analysis**
```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# In webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [new BundleAnalyzerPlugin()]
};
```

### Rendering Performance

**React Optimization**
```javascript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive render */}</div>;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Memoize computed values
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
```

**Virtual Scrolling**
```javascript
// For large lists (1000+ items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width='100%'
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

### Image Optimization

**Modern Formats**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback" loading="lazy">
</picture>
```

**Responsive Images**
```html
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Responsive image"
  loading="lazy"
>
```

**Image Compression**
```bash
# Using sharp (Node.js)
const sharp = require('sharp');

sharp('input.jpg')
  .resize(800)
  .webp({ quality: 80 })
  .toFile('output.webp');
```

### Caching Strategies

**Service Worker Caching**
```javascript
// Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**HTTP Caching Headers**
```javascript
// Express caching
app.use(express.static('public', {
  maxAge: '1y', // For immutable assets
  etag: true
}));

// API responses - short cache
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60'); // 1 minute
  res.json(data);
});
```

## Backend Performance

### Database Optimization

**Query Optimization**
```sql
-- Use EXPLAIN ANALYZE to understand query performance
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';

-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Use covering indexes
CREATE INDEX idx_users_email_name ON users(email, name);
```

**Connection Pooling**
```javascript
// PostgreSQL connection pool
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**N+1 Query Prevention**
```javascript
// Bad: N+1 queries
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id]);
}

// Good: Single query with JOIN
const usersWithPosts = await db.query(`
  SELECT u.*, p.*
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
`);

// Or use DataLoader for batching
const DataLoader = require('dataloader');

const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.query(
    'SELECT * FROM posts WHERE user_id = ANY($1)',
    [userIds]
  );
  return userIds.map(id => posts.filter(p => p.user_id === id));
});
```

### Caching

**Redis Caching**
```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Cache API response
async function getUser(id) {
  const cacheKey = `user:${id}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}
```

**Application-Level Caching**
```javascript
// In-memory cache with expiration
class Cache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}
```

### Async Operations

**Parallel Execution**
```javascript
// Bad: Sequential
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// Good: Parallel
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id)
]);
```

**Stream Processing**
```javascript
// Process large files with streams
const fs = require('fs');
const readline = require('readline');

async function processLargeFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    // Process line by line without loading entire file
    await processLine(line);
  }
}
```

## Monitoring

### Performance Metrics

**Web Vitals**
```javascript
// Measure Core Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(sendToAnalytics); // Cumulative Layout Shift
getFID(sendToAnalytics); // First Input Delay
getLCP(sendToAnalytics); // Largest Contentful Paint

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric);
}
```

**Custom Metrics**
```javascript
// Track custom performance metrics
class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }
  
  start(name) {
    this.metrics.set(name, performance.now());
  }
  
  end(name) {
    const start = this.metrics.get(name);
    const duration = performance.now() - start;
    
    // Send to monitoring
    console.log(`${name}: ${duration}ms`);
    
    return duration;
  }
}
```

### APM Integration

**Datadog**
```javascript
const tracer = require('dd-trace').init();

// Automatic instrumentation for Express, PostgreSQL, Redis, etc.
```

**Custom Logging**
```javascript
// Structured logging with performance data
logger.info('API request completed', {
  method: req.method,
  path: req.path,
  duration: Date.now() - startTime,
  statusCode: res.statusCode,
  userId: req.user?.id
});
```

## Performance Budgets

### Set Budgets
```json
{
  "performanceBudget": {
    "maxBundleSize": "250kb",
    "maxImageSize": "200kb",
    "maxFCP": "1.5s",
    "maxLCP": "2.5s",
    "maxCLS": "0.1",
    "maxFID": "100ms"
  }
}
```

### Automated Checks
```javascript
// Lighthouse CI
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
      },
    },
  },
};
```

## Quality Standards

- **Measure First**: Never optimize without baseline metrics
- **Quantify Impact**: Every optimization must show before/after
- **Minimal Changes**: Prefer small, targeted fixes
- **No Regressions**: Verify functionality isn't broken
- **Sustainable**: Set up monitoring to catch future regressions

**IMPORTANT**: Performance is a feature - treat it seriously.
**IMPORTANT**: Measure, don't guess - use profiling tools.
**IMPORTANT**: Optimize for the user, not benchmarks.
