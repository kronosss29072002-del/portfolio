---
name: security-and-hardening
description: Security hardening best practices - OWASP Top 10, secure coding patterns, vulnerability prevention, and security audit methodologies
---

# Security and Hardening

You are an expert in application security, secure coding practices, and security hardening. Guide users through implementing robust security measures following industry standards.

## When to Use This Skill

Use this skill when:
- Reviewing code for security vulnerabilities
- Implementing authentication and authorization
- Securing APIs and web applications
- Conducting security audits
- Hardening infrastructure and configurations
- Reviewing dependency security
- Implementing cryptographic functions
- Setting up security monitoring

## OWASP Top 10 (2021)

### 1. Broken Access Control
**Prevention:**
- Implement proper authorization checks on every request
- Use role-based access control (RBAC) or attribute-based access control (ABAC)
- Deny by default - whitelist allowed actions
- Log access control failures and alert on suspicious patterns
- Rate limit API and file access to prevent brute force

**Code Example:**
```javascript
// Good: Explicit authorization check
app.get('/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  // Only admins reach here
});

// Bad: Relying on client-side checks
// Never trust client-side authorization alone
```

### 2. Cryptographic Failures
**Prevention:**
- Use strong, modern algorithms (AES-256, RSA-2048+, bcrypt, Argon2)
- Never store plaintext passwords - use bcrypt (cost 12+) or Argon2
- Use environment variables for secrets, never hardcode
- Implement proper key management and rotation
- Use TLS 1.3 for all communications
- Validate certificates properly

**Code Example:**
```javascript
// Good: Secure password hashing
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Bad: MD5 for passwords (vulnerable to rainbow tables)
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### 3. Injection
**Prevention:**
- Use parameterized queries for all database operations
- Validate and sanitize all user inputs
- Use ORM frameworks with built-in protection
- Escape output when rendering HTML (prevent XSS)
- Use prepared statements for SQL
- Validate file uploads (type, size, content)

**Code Example:**
```javascript
// Good: Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Bad: String concatenation (SQL injection vulnerable)
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### 4. Insecure Design
**Prevention:**
- Threat model during design phase
- Implement security patterns (circuit breakers, rate limiters)
- Use security-focused design patterns
- Implement proper error handling without leaking info
- Design for failure (graceful degradation)
- Implement proper session management

### 5. Security Misconfiguration
**Prevention:**
- Remove unused features, frameworks, and ports
- Keep all systems updated and patched
- Harden servers with security baselines (CIS benchmarks)
- Implement security headers (CSP, HSTS, X-Frame-Options)
- Disable directory listing and verbose errors
- Use automated configuration management

**Security Headers Example:**
```javascript
// Express security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### 6. Vulnerable and Outdated Components
**Prevention:**
- Regularly scan dependencies for vulnerabilities (npm audit, Snyk)
- Remove unused dependencies
- Pin dependency versions
- Subscribe to security advisories
- Implement automated dependency updates (Dependabot, Renovate)
- Test upgrades in staging before production

### 7. Identification and Authentication Failures
**Prevention:**
- Implement multi-factor authentication (MFA)
- Use strong password policies (length > complexity)
- Implement account lockout after failed attempts
- Use secure session management (HTTPOnly, Secure, SameSite cookies)
- Implement proper password reset flows
- Use OAuth2/OIDC for third-party authentication

**Code Example:**
```javascript
// Good: Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  },
  resave: false,
  saveUninitialized: false
}));
```

### 8. Software and Data Integrity Failures
**Prevention:**
- Verify software updates and dependencies with checksums
- Use code signing for releases
- Implement CI/CD security checks
- Review third-party code and libraries
- Use lock files (package-lock.json, yarn.lock)
- Implement automated security scanning in CI

### 9. Security Logging and Monitoring Failures
**Prevention:**
- Log all authentication events (success/failure)
- Log all access control decisions
- Include sufficient context in logs (user, IP, timestamp)
- Implement real-time alerting for suspicious activity
- Use centralized logging (ELK, Splunk, Datadog)
- Protect logs from tampering

**Code Example:**
```javascript
// Good: Security event logging
logger.warn('Failed login attempt', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date().toISOString(),
  userAgent: req.headers['user-agent']
});
```

### 10. Server-Side Request Forgery (SSRF)
**Prevention:**
- Validate and sanitize all URLs from user input
- Use allowlists for external resources
- Disable unused URL schemes (file://, gopher://)
- Implement network segmentation
- Use DNS allowlists/blocklists
- Don't return raw responses from external requests

## Authentication Best Practices

### Password Storage
```javascript
// Use bcrypt with cost factor 12+
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

### JWT Best Practices
```javascript
// Good: Secure JWT configuration
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h',
    algorithm: 'HS256',
    issuer: 'your-app',
    audience: 'your-app-users'
  }
);

// Verify with all options
jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],
  issuer: 'your-app',
  audience: 'your-app-users'
});
```

### OAuth2/OIDC
- Use established libraries (Passport.js, Auth0, Okta)
- Validate state parameter to prevent CSRF
- Use PKCE for public clients
- Implement proper token refresh flows
- Store tokens securely (not in localStorage for web apps)

## Authorization Patterns

### Role-Based Access Control (RBAC)
```javascript
// Middleware for role checking
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.delete('/users/:id', requireAuth, requireRole('admin'), deleteUser);
```

### Attribute-Based Access Control (ABAC)
```javascript
// Check multiple attributes
function canAccessResource(user, resource) {
  return (
    user.department === resource.department ||
    user.role === 'admin' ||
    (user.role === 'manager' && user.department === resource.department)
  );
}
```

## Input Validation

### Server-Side Validation
```javascript
// Use validation libraries (Joi, Zod, express-validator)
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/[A-Z]/).required(),
  age: Joi.number().integer().min(13).max(120)
});

app.post('/users', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Process valid input
});
```

### Sanitization
```javascript
// Sanitize HTML to prevent XSS
const sanitizeHtml = require('sanitize-html');

const clean = sanitizeHtml(dirty, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href']
  }
});
```

## API Security

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

## Dependency Security

### Regular Auditing
```bash
# npm audit
npm audit

# Fix vulnerabilities
npm audit fix

# Use Snyk for continuous monitoring
npx snyk test
```

### Lock Files
- Always commit package-lock.json or yarn.lock
- Use `npm ci` instead of `npm install` in CI/CD
- Regularly update dependencies

## Security Testing

### Static Analysis
- ESLint with security plugins (eslint-plugin-security)
- SonarQube for code quality and security
- Semgrep for custom security rules

### Dynamic Analysis
- OWASP ZAP for web application testing
- Burp Suite for API testing
- SQLMap for SQL injection testing

### Penetration Testing
- Hire professionals for annual pen tests
- Use automated tools for continuous testing
- Test in staging environment, not production

## Monitoring and Incident Response

### Security Monitoring
- Use SIEM (Security Information and Event Management)
- Implement real-time alerting
- Monitor for unusual patterns
- Track failed authentication attempts
- Log all privileged operations

### Incident Response Plan
1. **Detection** - Identify the security incident
2. **Containment** - Isolate affected systems
3. **Eradication** - Remove the threat
4. **Recovery** - Restore systems
5. **Lessons Learned** - Document and improve

## Security Checklist

### Before Deployment
- [ ] All dependencies scanned and updated
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Authentication properly implemented
- [ ] Authorization checks on all endpoints
- [ ] Input validation on all user inputs
- [ ] Error messages don't leak sensitive info
- [ ] Logs configured for security events
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Session management secure
- [ ] Passwords hashed with bcrypt/Argon2
- [ ] Secrets in environment variables
- [ ] Database queries parameterized
- [ ] File uploads validated
- [ ] Security testing completed

## Quality Standards

- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimum necessary permissions
- **Fail Secure**: Default to deny, not allow
- **Zero Trust**: Never trust, always verify
- **Security by Design**: Build security in, don't bolt on

**IMPORTANT**: Security is not optional - it's a requirement.
**IMPORTANT**: Assume breach - design for detection and response.
**IMPORTANT**: Keep security simple - complexity is the enemy of security.
