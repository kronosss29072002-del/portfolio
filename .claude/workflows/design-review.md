# Design Review Workflow

## Purpose
Systematic design review process to validate architecture decisions, API contracts, scalability considerations, and technology choices before implementation.

## When to Use
- Before starting major feature implementation
- When evaluating new technologies or frameworks
- During architecture planning sessions
- Before API contract finalization
- When scaling concerns arise
- During technical debt assessment

## Workflow Steps

### Phase 1: Design Document Preparation
1. **Create Architecture Decision Record (ADR)**
   ```markdown
   # ADR-XXX: [Decision Title]
   
   ## Status
   [Proposed / Accepted / Deprecated / Superseded]
   
   ## Context
   [What is the issue? Why is a decision needed?]
   
   ## Decision
   [What is the change being proposed?]
   
   ## Consequences
   [What becomes easier or more difficult?]
   
   ## Alternatives Considered
   [What other options were evaluated?]
   ```

2. **Define Requirements**
   - Functional requirements (what it does)
   - Non-functional requirements (performance, scalability, security)
   - Constraints (budget, timeline, technology)
   - Success criteria (how to measure success)

3. **Delegate to planner agent**
   - Provide requirements and constraints
   - Request comprehensive design document

### Phase 2: Architecture Review
1. **System Context Diagram**
   - Identify external systems and integrations
   - Define data flows
   - Map trust boundaries

2. **Component Diagram**
   - Identify major components/modules
   - Define interfaces between components
   - Document dependencies

3. **Deployment Diagram**
   - Infrastructure requirements
   - Network topology
   - Scaling strategy

4. **Data Model**
   - Entity relationship diagram
   - Data flow diagrams
   - Storage requirements

5. **Review Checklist**
   - [ ] Separation of concerns
   - [ ] Single responsibility principle
   - [ ] Loose coupling, high cohesion
   - [ ] Failure isolation
   - [ ] Horizontal scaling capability
   - [ ] State management strategy
   - [ ] Caching strategy
   - [ ] Async vs sync decisions

### Phase 3: API Design Review
1. **API Contract Validation**
   - [ ] RESTful principles followed (if REST)
   - [ ] Consistent naming conventions
   - [ ] Proper HTTP methods and status codes
   - [ ] Pagination, filtering, sorting defined
   - [ ] Error responses standardized
   - [ ] Versioning strategy defined
   - [ ] Authentication/authorization clear

2. **OpenAPI/Swagger Spec Review**
   - [ ] All endpoints documented
   - [ ] Request/response schemas complete
   - [ ] Examples provided
   - [ ] Validation rules documented

3. **GraphQL Schema Review** (if applicable)
   - [ ] Type definitions complete
   - [ ] Query complexity limits set
   - [ ] DataLoader for N+1 prevention
   - [ ] Mutations return modified objects

4. **Delegate to api-designer agent**
   - Provide API requirements
   - Request OpenAPI spec or GraphQL schema

### Phase 4: Scalability Assessment
1. **Load Analysis**
   - Expected concurrent users
   - Request rate (requests/second)
   - Data volume growth rate
   - Peak load scenarios

2. **Bottleneck Identification**
   - Database queries
   - API response times
   - Network bandwidth
   - CPU/memory intensive operations
   - Third-party API rate limits

3. **Scaling Strategy**
   - [ ] Horizontal scaling capability
   - [ ] Database sharding/partitioning plan
   - [ ] Caching layers (Redis, CDN)
   - [ ] Load balancing strategy
   - [ ] Auto-scaling rules
   - [ ] Queue-based load leveling

4. **Performance Targets**
   - Response time: < 200ms (p95)
   - Throughput: X requests/second
   - Availability: 99.9% uptime
   - Data consistency requirements

### Phase 5: Technology Selection
1. **Evaluate Options**
   For each technology choice, evaluate:
   - Team expertise and learning curve
   - Community support and documentation
   - Performance characteristics
   - Licensing and cost
   - Long-term viability
   - Integration with existing stack

2. **Decision Matrix**
   ```markdown
   | Criteria | Weight | Option A | Option B | Option C |
   |----------|--------|----------|----------|----------|
   | Performance | 30% | 8/10 | 7/10 | 9/10 |
   | Learning Curve | 20% | 9/10 | 6/10 | 5/10 |
   | Community | 20% | 8/10 | 9/10 | 6/10 |
   | Cost | 15% | 9/10 | 8/10 | 7/10 |
   | Integration | 15% | 8/10 | 7/10 | 8/10 |
   | **Total** | 100% | **8.4** | **7.4** | **7.3** |
   ```

3. **Proof of Concept**
   - Build small prototype for critical decisions
   - Validate assumptions
   - Measure performance
   - Document findings

### Phase 6: Security Design Review
1. **Threat Modeling**
   - Identify assets to protect
   - Map attack surfaces
   - Define trust boundaries
   - List potential threats (STRIDE)

2. **Security Patterns**
   - [ ] Authentication mechanism chosen
   - [ ] Authorization model defined (RBAC/ABAC)
   - [ ] Input validation strategy
   - [ ] Encryption at rest and in transit
   - [ ] Secret management approach
   - [ ] Audit logging plan

3. **Compliance Requirements**
   - GDPR / CCPA (data privacy)
   - HIPAA (healthcare)
   - PCI DSS (payment cards)
   - SOC 2 (service organizations)
   - Industry-specific regulations

4. **Delegate to security-auditor agent**
   - Provide design documents
   - Request security review

### Phase 7: Cost Analysis
1. **Infrastructure Costs**
   - Cloud resources (compute, storage, network)
   - Managed services (databases, queues, caches)
   - Third-party APIs and services
   - Monitoring and logging

2. **Development Costs**
   - Team size and duration
   - Training and learning curve
   - Tooling and licenses
   - Ongoing maintenance

3. **ROI Calculation**
   - Expected revenue/benefits
   - Cost savings from automation
   - Risk mitigation value
   - Time to market advantage

### Phase 8: Risk Assessment
1. **Technical Risks**
   - Technology immaturity
   - Integration complexity
   - Performance unknowns
   - Scalability limitations

2. **Project Risks**
   - Timeline feasibility
   - Team skill gaps
   - Dependency on external teams
   - Scope creep potential

3. **Business Risks**
   - Market changes
   - Regulatory changes
   - Competitor actions
   - User adoption uncertainty

4. **Mitigation Strategies**
   For each risk:
   - Likelihood (Low/Medium/High)
   - Impact (Low/Medium/High/Critical)
   - Mitigation plan
   - Contingency plan

### Phase 9: Design Review Meeting
1. **Prepare Materials**
   - Design document
   - Architecture diagrams
   - API specifications
   - Risk assessment
   - Cost analysis

2. **Review Panel**
   - Tech lead / architect
   - Senior developers (2-3)
   - Security engineer
   - Product manager
   - DevOps engineer (if infrastructure changes)

3. **Review Agenda**
   - Design overview (15 min)
   - Deep dive into key decisions (30 min)
   - Q&A and discussion (30 min)
   - Risk review (15 min)
   - Decision and next steps (15 min)

4. **Document Feedback**
   - Record all questions and concerns
   - Note required changes
   - Capture action items with owners
   - Set follow-up date if needed

### Phase 10: Finalize Design
1. **Incorporating Feedback**
   - Address all review comments
   - Update design documents
   - Revise diagrams and specs
   - Document rationale for rejected suggestions

2. **Get Final Approval**
   - Circulate updated design
   - Get sign-off from stakeholders
   - Archive ADR with "Accepted" status

3. **Handoff to Implementation**
   - Create implementation tasks
   - Assign to development team
   - Schedule kickoff meeting
   - Provide context and Q&A session

## Output Artifacts

### Required
- [ ] Architecture Decision Record (ADR)
- [ ] System context diagram
- [ ] Component diagram
- [ ] API specification (OpenAPI/GraphQL schema)
- [ ] Data model (ERD)
- [ ] Security threat model
- [ ] Risk assessment matrix
- [ ] Cost analysis
- [ ] Review meeting notes

### Optional (based on project size)
- [ ] Deployment diagram
- [ ] Sequence diagrams for complex flows
- [ ] Performance benchmarks
- [ ] Proof of concept code
- [ ] Migration plan (if replacing existing system)

## Quality Gates

### Must Pass Before Implementation
- [ ] Design document completed and reviewed
- [ ] Architecture decision recorded (ADR)
- [ ] API contracts finalized
- [ ] Security review completed
- [ ] Scalability concerns addressed
- [ ] Risks identified and mitigated
- [ ] Stakeholder approval obtained

## Integration with Other Workflows

- **Primary Workflow**: Design review is Phase 1 (before implementation)
- **Security Review**: Security design review is part of this workflow
- **Development Rules**: Design must follow YANGI/KISS/DRY principles
- **Documentation Management**: Design docs become part of project documentation

## Common Anti-Patterns to Avoid

1. **Big Ball of Mud** - No clear architecture, everything connected to everything
2. **Premature Optimization** - Over-engineering for scale that may never come
3. **Resume-Driven Design** - Choosing technologies for novelty, not fit
4. **Ivory Tower Architecture** - Design disconnected from implementation reality
5. **Analysis Paralysis** - Endless design discussions without decisions
6. **Not Invented Here** - Building custom solutions when proven alternatives exist

## Metrics and KPIs

- Design review completion time: < 1 week for major features
- Rework due to design issues: < 10% of implementation time
- Architecture decision documentation: 100% of major decisions
- Design review satisfaction: > 80% positive feedback

## Continuous Improvement

- Retrospect on design decisions quarterly
- Update design guidelines based on lessons learned
- Share successful patterns across teams
- Maintain catalog of reusable architecture patterns
