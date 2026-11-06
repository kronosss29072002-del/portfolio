# Performance Optimization Workflow

## Purpose
Systematic approach to identifying, measuring, and resolving performance bottlenecks across frontend, backend, database, and infrastructure layers.

## When to Use
- Application is slow or unresponsive
- Need to reduce bundle size
- Database queries are slow
- Setting up performance monitoring
- Preparing for high-traffic events
- Optimizing costs (reduce resource usage)
- Meeting performance SLAs

## Workflow Steps

### Phase 1: Performance Baseline
1. **Define Key Metrics**
   - **Frontend**: FCP, LCP, CLS, FID, TTI, bundle size
   - **Backend**: Response time (p50, p95, p99), throughput, error rate
   - **Database**: Query time, connection pool usage, cache hit rate
   - **Infrastructure**: CPU, memory, disk I/O, network bandwidth

2. **Measure Current State**
   ```javascript
   // Frontend: Web Vitals
   import { getCLS, getFID, getLCP } from 'web-vitals';
   
   getCLS(console.log); // Cumulative Layout Shift
   getFID(console.log); // First Input Delay
   getLCP(console.log); // Largest Contentful Paint
   ```

   ```bash
   # Backend: Load testing
   npm install -g artillery
   artillery quick --count 100 --num 10 https://api.example.com/endpoint
   ```

   ```sql
   -- Database: Query analysis
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
   ```

3. **Set Performance Targets**
   ```json
   {
     "performanceBudget": {
       "maxBundleSize": "250kb",
       "maxFCP": "1.5s",
       "maxLCP": "2.5s",
       "maxCLS": "0.1",
       "maxFID": "100ms",
       "maxResponseTime": "200ms",
       "maxQueryTime": "50ms"
     }
   }
   ```

4. **Delegate to performance-optimizer agent**
   - Provide baseline metrics and targets
   - Request performance analysis

### Phase 2: Frontend Optimization

#### 2.1 Bundle Size Optimization
1. **Analyze Bundle**
   ```bash
   # Webpack Bundle Analyzer
   npm install --save-dev webpack-bundle-analyzer
   
   # In webpack.config.js
   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
   module.exports = {
     plugins: [new BundleAnalyzerPlugin()]
   };
   
   # Run build
   npm run build
   ```

2. **Code Splitting**
   ```javascript
   // Route-based splitting
   const UserProfile = React.lazy(() => import('./UserProfile'));
   
   // Component-based splitting
   const HeavyChart = React.lazy(() => import('./HeavyChart'));
   ```

3. **Tree Shaking**
   ```javascript
   // Good: Import only what you need
   import { debounce } from 'lodash';
   
   // Bad: Import entire library
   import _ from 'lodash';
   ```

4. **Dynamic Imports**
   ```javascript
   // Load on demand
   async function loadChart() {
     const { Chart } = await import('chart.js');
     return new Chart(ctx, config);
   }
   ```

5. **Remove Dead Code**
   ```bash
   # Use knip to find unused code
   npx knip
   
   # Use depcheck to find unused dependencies
   npx depcheck
   ```

#### 2.2 Rendering Performance
1. **React Optimization**
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

2. **Virtual Scrolling**
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

3. **Avoid Unnecessary Re-renders**
   ```javascript
   // Bad: Inline object creates new reference every render
   <Component style={{ color: 'red' }} />
   
   // Good: Stable reference
   const style = useMemo(() => ({ color: 'red' }), []);
   <Component style={style} />
   ```

#### 2.3 Image Optimization
1. **Modern Formats**
   ```html
   <picture>
     <source srcset="image.avif" type="image/avif">
     <source srcset="image.webp" type="image/webp">
     <img src="image.jpg" alt="Fallback" loading="lazy">
   </picture>
   ```

2. **Responsive Images**
   ```html
   <img
     src="image-800.jpg"
     srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
     alt="Responsive image"
     loading="lazy"
   >
   ```

3. **Image Compression**
   ```bash
   # Using sharp (Node.js)
   const sharp = require('sharp');
   
   sharp('input.jpg')
     .resize(800)
     .webp({ quality: 80 })
     .toFile('output.webp');
   ```

#### 2.4 Caching Strategies
1. **Service Worker Caching**
   ```javascript
   // Cache-first for static assets
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request).then((response) => {
         return response || fetch(event.request);
       })
     );
   });
   ```

2. **HTTP Caching Headers**
   ```javascript
   // Express
   app.use(express.static('public', {
     maxAge: '1y', // For immutable assets
     etag: true
   }));
   ```

3. **Critical CSS Inlining**
   ```html
   <style>
     /* Critical CSS inlined */
     body { margin: 0; font-family: sans-serif; }
     .header { /* ... */ }
   </style>
   <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
   ```

### Phase 3: Backend Optimization

#### 3.1 API Response Time
1. **Identify Slow Endpoints**
   ```javascript
   // Add timing middleware
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       if (duration > 200) {
         logger.warn('Slow endpoint', {
           method: req.method,
           path: req.path,
           duration
         });
       }
     });
     next();
   });
   ```

2. **Parallel Execution**
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

3. **Caching**
   ```javascript
   // Redis caching
   const Redis = require('ioredis');
   const redis = new Redis();
   
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

4. **Compression**
   ```javascript
   // Enable gzip compression
   const compression = require('compression');
   app.use(compression());
   ```

#### 3.2 Database Optimization
1. **Query Optimization**
   ```sql
   -- Use EXPLAIN ANALYZE
   EXPLAIN ANALYZE
   SELECT * FROM users WHERE email = 'user@example.com';
   
   -- Add indexes
   CREATE INDEX idx_users_email ON users(email);
   
   -- Use covering indexes
   CREATE INDEX idx_users_email_name ON users(email, name);
   ```

2. **Connection Pooling**
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

3. **N+1 Query Prevention**
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
   
   // Or use DataLoader
   const DataLoader = require('dataloader');
   
   const postLoader = new DataLoader(async (userIds) => {
     const posts = await db.query(
       'SELECT * FROM posts WHERE user_id = ANY($1)',
       [userIds]
     );
     return userIds.map(id => posts.filter(p => p.user_id === id));
   });
   ```

4. **Batch Operations**
   ```javascript
   // Bad: Individual inserts
   for (const user of users) {
     await db.query('INSERT INTO users ...', [user]);
   }
   
   // Good: Batch insert
   await db.query(
     'INSERT INTO users (name, email) VALUES ' +
     users.map((u, i) => `($${i*2+1}, $${i*2+2})`).join(', '),
     users.flatMap(u => [u.name, u.email])
   );
   ```

#### 3.3 Async Operations
1. **Stream Processing**
   ```javascript
   // Process large files with streams
   const fileStream = fs.createReadStream(filePath);
   const rl = readline.createInterface({
     input: fileStream,
     crlfDelay: Infinity
   });
   
   for await (const line of rl) {
     await processLine(line);
   }
   ```

2. **Queue-Based Processing**
   ```javascript
   // Use Bull queue for background jobs
   const Queue = require('bull');
   const emailQueue = new Queue('email', process.env.REDIS_URL);
   
   // Add job
   await emailQueue.add({ to: 'user@example.com', subject: 'Welcome' });
   
   // Process job
   emailQueue.process(async (job) => {
     await sendEmail(job.data);
   });
   ```

### Phase 4: Infrastructure Optimization

#### 4.1 Resource Right-Sizing
1. **Monitor Resource Usage**
   ```bash
   # CPU and memory
   kubectl top pods
   kubectl top nodes
   
   # CloudWatch / Datadog metrics
   ```

2. **Set Resource Limits**
   ```yaml
   resources:
     requests:
       memory: "256Mi"
       cpu: "250m"
     limits:
       memory: "512Mi"
       cpu: "500m"
   ```

3. **Auto-Scaling**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: myapp-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: myapp
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
   ```

#### 4.2 CDN and Caching
1. **CDN Configuration**
   ```javascript
   // Serve static assets from CDN
   app.use('/static', express.static('public', {
     maxAge: '1y',
     setHeaders: (res, path) => {
       res.set('Cache-Control', 'public, max-age=31536000, immutable');
     }
   }));
   ```

2. **API Caching**
   ```javascript
   // Cache API responses
   app.get('/api/data', (req, res) => {
     res.set('Cache-Control', 'public, max-age=60');
     res.json(data);
   });
   ```

#### 4.3 Load Balancing
1. **Health Checks**
   ```javascript
   app.get('/health', (req, res) => {
     res.json({ status: 'healthy', timestamp: new Date().toISOString() });
   });
   ```

2. **Sticky Sessions** (if needed)
   ```yaml
   # Kubernetes ingress
   annotations:
     nginx.ingress.kubernetes.io/affinity: "cookie"
     nginx.ingress.kubernetes.io/session-cookie-name: "route"
   ```

### Phase 5: Monitoring and Alerting

#### 5.1 Performance Monitoring
1. **Application Performance Monitoring (APM)**
   ```javascript
   // Datadog
   const tracer = require('dd-trace').init();
   
   // New Relic
   require('newrelic');
   ```

2. **Custom Metrics**
   ```javascript
   const client = require('prom-client');
   
   const requestDuration = new client.Histogram({
     name: 'http_request_duration_seconds',
     help: 'HTTP request duration in seconds',
     buckets: [0.1, 0.5, 1, 2, 5]
   });
   ```

3. **Real User Monitoring (RUM)**
   ```javascript
   // Send Web Vitals to analytics
   import { getCLS, getFID, getLCP } from 'web-vitals';
   
   function sendToAnalytics(metric) {
     const body = JSON.stringify({
       name: metric.name,
       value: metric.value,
       id: metric.id
     });
     navigator.sendBeacon('/analytics', body);
   }
   
   getCLS(sendToAnalytics);
   getFID(sendToAnalytics);
   getLCP(sendToAnalytics);
   ```

#### 5.2 Alerting
1. **Performance Alerts**
   ```yaml
   # Prometheus alert rules
   groups:
   - name: performance
     rules:
     - alert: HighLatency
       expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "High latency detected"
         description: "95th percentile latency is {{ $value }}s"
   ```

2. **Error Rate Alerts**
   ```yaml
   - alert: HighErrorRate
     expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
     for: 5m
     labels:
       severity: critical
     annotations:
       summary: "High error rate detected"
   ```

### Phase 6: Performance Testing

#### 6.1 Load Testing
1. **Artillery**
   ```yaml
   # load-test.yml
   config:
     target: "https://api.example.com"
     phases:
       - duration: 60
         arrivalRate: 10
   scenarios:
     - flow:
         - get:
             url: "/api/users"
   ```

   ```bash
   artillery run load-test.yml
   ```

2. **k6**
   ```javascript
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   
   export const options = {
     stages: [
       { duration: '30s', target: 20 },
       { duration: '1m', target: 20 },
       { duration: '30s', target: 0 },
     ],
   };
   
   export default function () {
     const res = http.get('https://api.example.com/users');
     check(res, { 'status is 200': (r) => r.status === 200 });
     sleep(1);
   }
   ```

#### 6.2 Stress Testing
1. **Find Breaking Point**
   ```bash
   # Gradually increase load until system fails
   artillery quick --count 1000 --num 100 https://api.example.com
   ```

2. **Recovery Testing**
   - Push system to breaking point
   - Reduce load
   - Verify system recovers

#### 6.3 Soak Testing
1. **Long-Running Test**
   ```yaml
   # soak-test.yml
   config:
     target: "https://api.example.com"
     phases:
       - duration: 24h
         arrivalRate: 50
   ```

2. **Monitor for Memory Leaks**
   - Track memory usage over time
   - Look for gradual increases
   - Check for connection leaks

### Phase 7: Optimization Report

1. **Document Findings**
   ```markdown
   # Performance Optimization Report
   
   ## Baseline Metrics
   | Metric | Before | Target | After |
   |--------|--------|--------|-------|
   | FCP | 3.2s | 1.5s | 1.3s |
   | LCP | 5.1s | 2.5s | 2.2s |
   | Bundle Size | 1.2MB | 250KB | 220KB |
   | API Response Time | 450ms | 200ms | 180ms |
   
   ## Optimizations Applied
   1. Code splitting - reduced bundle by 60%
   2. Image optimization - reduced image size by 70%
   3. Database indexing - reduced query time by 80%
   4. Redis caching - reduced API response time by 50%
   
   ## Remaining Issues
   - Third-party script adding 200ms to FCP
   - Large dataset pagination needs optimization
   
   ## Recommendations
   - Implement service worker for offline support
   - Add CDN for static assets
   - Set up continuous performance monitoring
   ```

2. **Set Up Regression Detection**
   ```yaml
   # Lighthouse CI
   ci:
     collect:
       url: ['http://localhost:3000']
     assert:
       assertions:
         'categories:performance': ['error', { minScore: 0.9 }]
         'first-contentful-paint': ['error', { maxNumericValue: 1500 }]
   ```

3. **Create Performance Budget**
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

## Quality Standards

- **Measure First**: Never optimize without baseline metrics
- **Quantify Impact**: Every optimization must show before/after
- **Minimal Changes**: Prefer small, targeted fixes
- **No Regressions**: Verify functionality isn't broken
- **Sustainable**: Set up monitoring to catch future regressions

## Integration with Other Workflows

- **Primary Workflow**: Performance optimization can happen at any phase
- **CI/CD Integration**: Performance tests in pipeline
- **Code Review**: Performance considerations in PR reviews
- **Security Review**: Performance impact of security measures

## Metrics and KPIs

- Performance score (Lighthouse): > 90
- Core Web Vitals: All "good" thresholds met
- API response time (p95): < 200ms
- Database query time (p95): < 50ms
- Bundle size: < 250KB
- Time to interactive: < 3s

## Continuous Improvement

- Review performance metrics weekly
- Identify and fix regressions immediately
- Update performance budgets as needed
- Share performance wins with team
- Conduct performance retrospectives
