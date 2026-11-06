---
name: observability-and-instrumentation
description: Observability and instrumentation best practices - logging, metrics, tracing, monitoring, and alerting for production systems
---

# Observability and Instrumentation

You are an expert in observability, monitoring, and instrumentation. Guide users through implementing comprehensive monitoring systems for production applications.

## When to Use This Skill

Use this skill when:
- Setting up monitoring for new applications
- Adding logging and metrics to existing systems
- Implementing distributed tracing
- Configuring alerting and on-call
- Debugging production issues
- Setting up dashboards and visualization
- Implementing health checks
- Monitoring infrastructure and applications

## The Three Pillars of Observability

### 1. Logs - What Happened

**Structured Logging**
```javascript
// Good: Structured JSON logs
const logger = require('pino')();

logger.info({
  event: 'user_login',
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  duration: Date.now() - startTime
});

// Bad: Unstructured string logs
console.log(`User ${user.id} logged in from ${req.ip}`);
```

**Log Levels**
```javascript
// Use appropriate log levels
logger.error('Database connection failed', { error, database });
logger.warn('High memory usage detected', { memoryUsage: process.memoryUsage() });
logger.info('User created', { userId, email });
logger.debug('Query executed', { query, duration });
```

**Log Correlation**
```javascript
// Add correlation IDs for request tracing
const { v4: uuidv4 } = require('uuid');

app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Include in all logs
logger.info({
  correlationId: req.correlationId,
  event: 'api_request',
  method: req.method,
  path: req.path
});
```

### 2. Metrics - What's Happening Now

**Application Metrics**
```javascript
const client = require('prom-client');

// Counter - counts events
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Gauge - current value
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Histogram - distribution of values
const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Record metrics
app.use((req, res, next) => {
  const end = requestDuration.startTimer();
  
  res.on('finish', () => {
    end();
    httpRequests.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  
  next();
});
```

**Business Metrics**
```javascript
// Track business-relevant metrics
const userSignups = new client.Counter({
  name: 'user_signups_total',
  help: 'Total user signups',
  labelNames: ['plan', 'source']
});

const ordersCompleted = new client.Counter({
  name: 'orders_completed_total',
  help: 'Total completed orders',
  labelNames: ['product_type']
});

// Record in business logic
async function createUser(userData) {
  const user = await db.users.create(userData);
  userSignups.inc({ plan: userData.plan, source: userData.source });
  return user;
}
```

### 3. Traces - How Things Connect

**Distributed Tracing**
```javascript
const tracer = require('jaeger-client').initTracer({
  serviceName: 'my-service',
  sampler: { type: 'const', param: 1 }
});

// Start a span
const span = tracer.startSpan('process-order');
span.setTag('order.id', orderId);

// Create child spans
const dbSpan = tracer.startSpan('database-query', { childOf: span });
const result = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
dbSpan.finish();

const paymentSpan = tracer.startSpan('payment-processing', { childOf: span });
await processPayment(orderId);
paymentSpan.finish();

span.finish();
```

**OpenTelemetry**
```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces' });
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = provider.getTracer('my-service');

// Use tracer
const span = tracer.startSpan('process-request');
// ... do work
span.end();
```

## Monitoring Stack

### Prometheus + Grafana

**Prometheus Configuration**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'my-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

**Express Metrics Endpoint**
```javascript
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Logstash Configuration**
```
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }
  
  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

### Datadog

**Integration**
```javascript
const tracer = require('dd-trace').init({
  service: 'my-service',
  env: process.env.NODE_ENV
});

// Automatic instrumentation for Express, PostgreSQL, Redis, etc.
```

**Custom Metrics**
```javascript
const StatsD = require('hot-shots');
const dogstatsd = new StatsD();

// Increment counter
dogstatsd.increment('orders.created');

// Record timing
dogstatsd.timing('db.query.duration', duration);

// Record gauge
dogstatsd.gauge('active.users', activeUserCount);
```

## Alerting

### Alert Rules

**Prometheus Alert Rules**
```yaml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"
```

### Alert Channels

**Slack Integration**
```javascript
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_TOKEN);

async function sendAlert(message, severity) {
  const color = severity === 'critical' ? 'danger' : 'warning';
  
  await slack.chat.postMessage({
    channel: '#alerts',
    attachments: [{
      color,
      title: `Alert: ${message.title}`,
      text: message.description,
      fields: [
        { title: 'Severity', value: severity, short: true },
        { title: 'Time', value: new Date().toISOString(), short: true }
      ]
    }]
  });
}
```

## Health Checks

**Express Health Check**
```javascript
app.get('/health', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };
  
  // Database check
  try {
    await db.query('SELECT 1');
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'unhealthy';
  }
  
  // Redis check
  try {
    await redis.ping();
    checks.checks.redis = 'healthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    checks.status = 'unhealthy';
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

## Dashboards

### Grafana Dashboard Panels

**Key Metrics to Display**
- Request rate (requests/second)
- Error rate (errors/second, error percentage)
- Latency (p50, p95, p99)
- Active connections
- CPU and memory usage
- Database query times
- Cache hit rate
- Queue lengths

**Dashboard JSON Example**
```json
{
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
        }
      ]
    }
  ]
}
```

## Best Practices

### Logging
- Use structured JSON logs
- Include correlation IDs
- Log at appropriate levels
- Don't log sensitive data (passwords, tokens, PII)
- Rotate logs regularly
- Centralize logs

### Metrics
- Use appropriate metric types (counter, gauge, histogram)
- Label metrics appropriately
- Set up alerts for critical metrics
- Track both technical and business metrics
- Use meaningful names and units

### Tracing
- Trace all requests end-to-end
- Include relevant tags and baggage
- Sample appropriately (not 100% in production)
- Correlate traces with logs and metrics

### Alerting
- Alert on symptoms, not causes
- Use appropriate severity levels
- Include actionable information
- Avoid alert fatigue
- Test alerts regularly

## Quality Standards

- **Comprehensive**: Monitor all critical paths
- **Actionable**: Alerts should lead to clear actions
- **Accurate**: Metrics should reflect reality
- **Timely**: Detect issues before users do
- **Maintainable**: Easy to update and extend

**IMPORTANT**: Observability is not optional - it's essential for production systems.
**IMPORTANT**: Monitor what matters to users, not just what's easy to measure.
**IMPORTANT**: Test your monitoring - ensure alerts fire when they should.
