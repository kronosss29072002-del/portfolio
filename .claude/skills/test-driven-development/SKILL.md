---
name: test-driven-development
description: Test-Driven Development (TDD) methodology - write tests first, then code, following RED-GREEN-REFACTOR cycle
---

# Test-Driven Development

You are an expert in Test-Driven Development methodology. Guide users through the RED-GREEN-REFACTOR cycle to produce well-tested, maintainable code.

## When to Use This Skill

Use this skill when:
- Implementing new features with TDD approach
- Improving test coverage
- Refactoring existing code safely
- Teaching TDD practices
- Debugging complex issues with test-first approach

## Core TDD Cycle

### 1. RED - Write a Failing Test
- Write the smallest possible test that describes the desired behavior
- Run the test and watch it fail (this validates the test is working)
- Test should fail for the right reason (not missing import, etc.)

### 2. GREEN - Make It Pass
- Write the MINIMUM code to make the test pass
- Don't over-engineer or add features not covered by tests
- Resist urge to "just add this one more thing"

### 3. REFACTOR - Improve Code Quality
- Remove duplication (DRY)
- Improve naming and clarity
- Simplify complex logic
- Ensure all tests still pass after refactoring

## Testing Best Practices

### Test Structure (AAA Pattern)
```javascript
describe('UserService', () => {
  it('should create user with valid data', () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    
    // Act
    const user = userService.create(userData);
    
    // Assert
    expect(user).toBeDefined();
    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
  });
});
```

### Test Naming Convention
- Use descriptive names: `should_create_user_when_valid_data_provided`
- Follow pattern: `should_[expected_behavior]_when_[condition]`
- One assertion per test when possible
- Test behavior, not implementation

### What to Test
- **Happy path**: Normal expected behavior
- **Edge cases**: Empty inputs, null values, boundaries
- **Error cases**: Invalid inputs, exceptions, failures
- **Integration points**: API calls, database operations, file I/O

### What NOT to Test
- Private methods (test via public interface)
- Third-party library internals
- Trivial getters/setters
- Implementation details that may change

## Test Coverage Guidelines

### Coverage Targets
- **Unit tests**: 80%+ coverage
- **Critical paths**: 95%+ coverage (auth, payments, data integrity)
- **Integration tests**: Cover all external integrations
- **E2E tests**: Cover critical user flows

### Coverage Anti-Patterns
- Don't chase 100% coverage (diminishing returns)
- Don't test implementation details
- Don't write tests that always pass
- Don't ignore failing tests

## Mocking and Stubbing

### When to Mock
- External services (APIs, databases)
- Slow operations (file I/O, network calls)
- Non-deterministic behavior (time, random)
- Isolating unit under test

### When NOT to Mock
- Simple value objects
- Pure functions
- Standard library functions
- When it makes tests harder to understand

### Mocking Best Practices
```javascript
// Good: Mock at the boundary
jest.spyOn(api, 'fetchUser').mockResolvedValue({ id: 1, name: 'John' });

// Bad: Mocking internal implementation
jest.spyOn(userService, 'validateEmail').mockReturnValue(true);
```

## TDD Workflow

### Starting a New Feature
1. **Understand requirements** - What behavior is expected?
2. **Write first test** - Smallest possible behavior
3. **Run test** - Watch it fail (RED)
4. **Write minimal code** - Just enough to pass (GREEN)
5. **Run test** - Verify it passes
6. **Refactor** - Improve code quality
7. **Repeat** - Add next smallest behavior

### Refactoring Safely
1. **Ensure all tests pass** before starting
2. **Make small changes** - one refactor at a time
3. **Run tests frequently** - after each change
4. **Revert if tests fail** - don't debug while refactoring
5. **Commit when green** - small, logical commits

## Testing Frameworks

### JavaScript/TypeScript
- **Jest**: General purpose, great for React/Node
- **Vitest**: Fast, Vite-native alternative to Jest
- **Mocha**: Flexible, good for complex setups
- **Playwright**: E2E testing with browser automation

### Python
- **pytest**: Modern, Pythonic, powerful fixtures
- **unittest**: Built-in, xUnit style
- **hypothesis**: Property-based testing

### Best Practices by Framework
```javascript
// Jest: Use describe/it for organization
describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
  });
});
```

## Common TDD Patterns

### Transformation Priority Premise
Start with simple transformations, progress to complex:
1. (-) No code at all → code that passes
2. (nil) → actual value
3. Literal → variable
4. Conditional → unconditional
5. Scalar → collection
6. Statement → function
7. Hard-coded → injected dependency

### Fake It Till You Make It
- Return hardcoded values first
- Generalize only when you have multiple tests
- Avoid premature abstraction

### Triangulation
- Write multiple tests with different values
- Generalize the implementation to handle all cases
- Prevents overfitting to single test case

## Debugging with Tests

### When Bug Found
1. **Write failing test** that reproduces the bug
2. **Verify test fails** for the right reason
3. **Fix the bug** (minimum code change)
4. **Verify test passes**
5. **Run full suite** to ensure no regressions

### Test-Driven Debugging Benefits
- Prevents regression (bug won't reappear)
- Documents the bug (test serves as specification)
- Validates the fix (test proves bug is resolved)

## Anti-Patterns to Avoid

### Test-After Development
- Writing tests after code is written
- Leads to tests that verify implementation, not behavior
- Misses opportunity to design via tests

### Testing Implementation Details
```javascript
// Bad: Testing private method
expect(service.validateInput(input)).toBe(true);

// Good: Testing public behavior
expect(service.process(input)).toEqual(expectedResult);
```

### Brittle Tests
- Tests that break when implementation changes
- Over-mocking internal details
- Hardcoded values that should be dynamic

### Slow Tests
- Tests that take too long to run
- Not using mocks for external calls
- Not parallelizing independent tests

## Quality Standards

- **Fast**: Tests should run in seconds, not minutes
- **Isolated**: Tests don't depend on each other
- **Repeatable**: Same result every time
- **Self-validating**: No manual checking needed
- **Timely**: Written before or with production code

**IMPORTANT**: Always run tests before committing code.
**IMPORTANT**: Fix broken tests immediately - don't let them accumulate.
**IMPORTANT**: Review test quality in code reviews - bad tests are worse than no tests.
