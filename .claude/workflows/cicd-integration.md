# CI/CD Integration Workflow

## Purpose
Establish robust CI/CD pipelines for automated building, testing, security scanning, and deployment with proper environment management and rollback procedures.

## When to Use
- Setting up CI/CD for new projects
- Migrating existing projects to automated pipelines
- Optimizing slow or unreliable pipelines
- Adding new stages (security, performance, deployment)
- Troubleshooting pipeline failures
- Implementing deployment strategies (blue-green, canary)

## Workflow Steps

### Phase 1: Pipeline Design
1. **Identify Pipeline Stages**
   ```
   Code Push → Build → Test → Security Scan → Quality Check → 
   Package → Deploy Staging → Integration Test → Deploy Production
   ```

2. **Define Triggers**
   - On push to main/develop branches
   - On pull request creation/update
   - On tag creation (for releases)
   - Manual trigger for hotfixes
   - Scheduled (nightly builds, dependency updates)

3. **Environment Strategy**
   - **Development**: Feature branches, ephemeral environments
   - **Staging**: Develop branch, persistent environment
   - **Production**: Main branch, blue-green or canary deployment

4. **Delegate to devops-engineer agent**
   - Provide requirements and constraints
   - Request pipeline configuration

### Phase 2: Build Stage
1. **Dependency Installation**
   ```yaml
   - name: Install dependencies
     run: npm ci  # Use ci for reproducible builds
   ```

2. **Build Application**
   ```yaml
   - name: Build
     run: npm run build
   ```

3. **Caching Strategy**
   ```yaml
   - name: Cache node modules
     uses: actions/cache@v4
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
       restore-keys: |
         ${{ runner.os }}-node-
   ```

4. **Artifact Management**
   ```yaml
   - name: Upload build artifacts
     uses: actions/upload-artifact@v4
     with:
       name: build
       path: dist/
       retention-days: 7
   ```

### Phase 3: Test Stage
1. **Unit Tests**
   ```yaml
   - name: Run unit tests
     run: npm test
   
   - name: Upload coverage
     uses: actions/upload-artifact@v4
     with:
       name: coverage
       path: coverage/
   ```

2. **Integration Tests**
   ```yaml
   - name: Start test database
     run: docker-compose -f docker-compose.test.yml up -d
   
   - name: Run integration tests
     run: npm run test:integration
   ```

3. **E2E Tests**
   ```yaml
   - name: Run E2E tests
     uses: cypress-io/github-action@v6
     with:
       start: npm start
       wait-on: 'http://localhost:3000'
   ```

4. **Test Parallelization**
   ```yaml
   strategy:
     matrix:
       test-group: [unit, integration, e2e]
   steps:
     - run: npm run test:${{ matrix.test-group }}
   ```

5. **Coverage Thresholds**
   ```yaml
   - name: Check coverage
     run: |
       COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
       if (( $(echo "$COVERAGE < 80" | bc -l) )); then
         echo "Coverage below 80%"
         exit 1
       fi
   ```

### Phase 4: Security Stage
1. **Dependency Audit**
   ```yaml
   - name: Run security audit
     run: npm audit --audit-level=high
   ```

2. **Snyk Integration**
   ```yaml
   - name: Run Snyk
     uses: snyk/actions/node@master
     env:
       SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
   ```

3. **Secret Scanning**
   ```yaml
   - name: Scan for secrets
     uses: trufflesecurity/trufflehog@main
     with:
       path: ./
   ```

4. **Static Analysis**
   ```yaml
   - name: Run Semgrep
     uses: returntocorp/semgrep-action@v1
     with:
       config: >-
         p/security-audit
         p/owasp-top-ten
   ```

5. **Container Scanning** (if using Docker)
   ```yaml
   - name: Scan Docker image
     uses: aquasecurity/trivy-action@master
     with:
       image-ref: ${{ env.IMAGE_NAME }}
       format: 'sarif'
       output: 'trivy-results.sarif'
   ```

### Phase 5: Quality Stage
1. **Linting**
   ```yaml
   - name: Run linter
     run: npm run lint
   ```

2. **Type Checking**
   ```yaml
   - name: Type check
     run: npm run type-check
   ```

3. **Code Formatting**
   ```yaml
   - name: Check formatting
     run: npm run format:check
   ```

4. **Bundle Size Analysis**
   ```yaml
   - name: Analyze bundle size
     run: npm run build:analyze
   
   - name: Check bundle size
     run: |
       SIZE=$(du -sk dist/main.js | cut -f1)
       if [ $SIZE -gt 500 ]; then
         echo "Bundle size exceeds 500KB"
         exit 1
       fi
   ```

### Phase 6: Package Stage
1. **Docker Build**
   ```yaml
   - name: Set up Docker Buildx
     uses: docker/setup-buildx-action@v3
   
   - name: Login to Docker Hub
     uses: docker/login-action@v3
     with:
       username: ${{ secrets.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   
   - name: Build and push
     uses: docker/build-push-action@v5
     with:
       push: true
       tags: |
         ${{ env.IMAGE_NAME }}:latest
         ${{ env.IMAGE_NAME }}:${{ github.sha }}
       cache-from: type=gha
       cache-to: type=gha,mode=max
   ```

2. **Helm Chart Update** (if using Kubernetes)
   ```yaml
   - name: Update Helm chart
     run: |
       helm package ./charts/myapp --version ${{ github.sha }}
       helm push myapp-${{ github.sha }}.tgz oci://registry.example.com/charts
   ```

### Phase 7: Deploy Staging
1. **Environment Setup**
   ```yaml
   - name: Deploy to staging
     environment: staging
     run: |
       kubectl set image deployment/myapp myapp=$IMAGE_TAG
       kubectl rollout status deployment/myapp
   ```

2. **Database Migrations**
   ```yaml
   - name: Run migrations
     run: |
       kubectl exec -it deployment/myapp -- npm run migrate
   ```

3. **Smoke Tests**
   ```yaml
   - name: Run smoke tests
     run: |
       curl -f https://staging.example.com/health || exit 1
       npm run test:smoke
   ```

4. **Integration Tests Against Staging**
   ```yaml
   - name: Run integration tests
     run: npm run test:integration:staging
   ```

### Phase 8: Deploy Production
1. **Approval Gate**
   ```yaml
   - name: Wait for approval
     environment: production
   ```

2. **Blue-Green Deployment**
   ```yaml
   - name: Deploy to green
     run: |
       kubectl set image deployment/myapp-green myapp=$IMAGE_TAG
       kubectl rollout status deployment/myapp-green
   
   - name: Switch traffic to green
     run: |
       kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'
   
   - name: Verify deployment
     run: |
       sleep 30
       curl -f https://example.com/health || exit 1
   
   - name: Cleanup blue
     run: |
       kubectl set image deployment/myapp-blue myapp=$PREVIOUS_TAG
   ```

3. **Canary Deployment**
   ```yaml
   - name: Deploy canary (10% traffic)
     run: |
       kubectl set image deployment/myapp-canary myapp=$IMAGE_TAG
       kubectl scale deployment/myapp-canary --replicas=1
   
   - name: Monitor canary (15 minutes)
     run: |
       for i in {1..15}; do
         ERROR_RATE=$(curl -s https://metrics.example.com/error-rate)
         if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
           echo "Error rate too high, rolling back"
           kubectl delete deployment/myapp-canary
           exit 1
         fi
         sleep 60
       done
   
   - name: Promote canary
     run: |
       kubectl set image deployment/myapp myapp=$IMAGE_TAG
       kubectl delete deployment/myapp-canary
   ```

4. **Post-Deployment Verification**
   ```yaml
   - name: Run health checks
     run: |
       for i in {1..10}; do
         curl -f https://example.com/health && break
         sleep 5
       done
   
   - name: Run E2E tests
     run: npm run test:e2e:production
   ```

### Phase 9: Rollback Procedures
1. **Automatic Rollback**
   ```yaml
   - name: Rollback on failure
     if: failure()
     run: |
       kubectl rollout undo deployment/myapp
       kubectl rollout status deployment/myapp
   ```

2. **Manual Rollback**
   ```yaml
   - name: Manual rollback
     if: github.event_name == 'workflow_dispatch'
     run: |
       kubectl set image deployment/myapp myapp=$ROLLBACK_TAG
       kubectl rollout status deployment/myapp
   ```

3. **Database Rollback**
   ```yaml
   - name: Rollback migrations
     run: |
       kubectl exec -it deployment/myapp -- npm run migrate:rollback
   ```

### Phase 10: Monitoring and Alerting
1. **Deployment Notifications**
   ```yaml
   - name: Notify Slack
     if: success()
     run: |
       curl -X POST -H 'Content-type: application/json' \
         --data '{"text":"✅ Deployment successful: ${{ github.sha }}"}' \
         ${{ secrets.SLACK_WEBHOOK }}
   ```

2. **Performance Monitoring**
   ```yaml
   - name: Check performance metrics
     run: |
       # Wait for metrics to stabilize
       sleep 300
       
       # Check response time
       RESPONSE_TIME=$(curl -s https://metrics.example.com/response-time)
       if (( $(echo "$RESPONSE_TIME > 500" | bc -l) )); then
         echo "Response time degraded"
         exit 1
       fi
   ```

3. **Error Rate Monitoring**
   ```yaml
   - name: Monitor error rate
     run: |
       ERROR_RATE=$(curl -s https://metrics.example.com/error-rate)
       if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
         echo "Error rate too high"
         exit 1
       fi
   ```

## Pipeline Optimization

### Caching Strategies
1. **Dependency Caching**
   - Cache node_modules, pip packages, etc.
   - Use lock file hash as cache key

2. **Build Caching**
   - Cache build outputs
   - Use Docker layer caching

3. **Test Caching**
   - Cache test results
   - Skip unchanged tests

### Parallelization
1. **Job Parallelization**
   - Run independent jobs in parallel
   - Use matrix strategy for multi-environment testing

2. **Test Parallelization**
   - Split test suites across runners
   - Use test impact analysis

### Speed Improvements
1. **Fast Feedback**
   - Run fast checks first (lint, type check)
   - Run slow checks later (E2E, integration)

2. **Incremental Builds**
   - Only build changed components
   - Use build tools with incremental compilation

3. **Resource Optimization**
   - Use appropriate runner sizes
   - Spot instances for non-critical jobs

## Security Best Practices

### Secrets Management
1. **Use Environment Secrets**
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

2. **OIDC for Cloud Providers**
   ```yaml
   - name: Configure AWS credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
       aws-region: us-west-2
   ```

3. **Secret Rotation**
   - Rotate secrets regularly
   - Use short-lived tokens when possible

### Pipeline Security
1. **Pin Action Versions**
   ```yaml
   uses: actions/checkout@v4  # Not @main
   ```

2. **Review Third-Party Actions**
   - Audit actions before use
   - Prefer official actions

3. **Limit Permissions**
   ```yaml
   permissions:
     contents: read
     packages: write
   ```

## Environment Management

### Environment Variables
```yaml
# .github/environments/staging.env
DATABASE_URL=postgresql://staging-db:5432/app
REDIS_URL=redis://staging-redis:6379
API_URL=https://staging-api.example.com
```

### Environment Protection Rules
- Require approval for production deployments
- Restrict branch deployment (main only for production)
- Require successful staging deployment first

## Monitoring and Observability

### Pipeline Metrics
- Pipeline duration
- Success/failure rate
- Stage duration breakdown
- Cache hit rate
- Flaky test rate

### Deployment Metrics
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate

### Alerting
- Pipeline failures
- Deployment failures
- Performance degradation post-deployment
- Security vulnerabilities found

## Troubleshooting Common Issues

### Build Failures
1. **Dependency Conflicts**
   - Check package-lock.json consistency
   - Clear cache and reinstall

2. **Environment Differences**
   - Use Docker for consistent environments
   - Pin dependency versions

### Test Failures
1. **Flaky Tests**
   - Identify and quarantine flaky tests
   - Fix root causes (timing, race conditions)

2. **Test Data Issues**
   - Use test fixtures
   - Isolate test data

### Deployment Failures
1. **Health Check Failures**
   - Increase health check timeout
   - Check application logs

2. **Database Migration Failures**
   - Test migrations locally first
   - Have rollback plan ready

## Integration with Other Workflows

- **Primary Workflow**: CI/CD runs after testing phase
- **Security Review**: Security scans integrated into pipeline
- **Design Review**: API contracts validated in pipeline
- **Documentation Management**: Auto-generate docs on release

## Quality Gates

### Must Pass Before Merge
- [ ] All tests passing
- [ ] Linting checks passed
- [ ] Security scans clean
- [ ] Coverage thresholds met
- [ ] Build successful

### Must Pass Before Production
- [ ] Staging deployment successful
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Approval from team lead
- [ ] No Critical/High security issues

## Metrics and KPIs

- Pipeline duration: < 10 minutes
- Deployment frequency: Daily or more
- Lead time for changes: < 1 day
- Change failure rate: < 5%
- Mean time to recovery: < 1 hour

## Continuous Improvement

- Review pipeline metrics weekly
- Identify and eliminate bottlenecks
- Reduce flaky tests
- Improve cache hit rates
- Optimize resource usage
