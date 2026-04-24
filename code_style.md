# Java Development Best Practices

**Request for Discussion (RFD)**

---

## 1. Introduction

This document establishes unified Java development standards for our team. These guidelines are framework-agnostic and apply to all Java projects regardless of architecture or technology stack.

**Goals:**

- Ensure code consistency across team projects
- Improve code maintainability and readability
- Reduce technical debt and code review friction
- Establish clear testing standards

---

## 2. Code Design Principles

### 2.1 SOLID Principles

Apply SOLID principles to create maintainable, flexible code:

- **Single Responsibility Principle**: Each class should have one reason to change
- **Open/Closed Principle**: Open for extension, closed for modification
- **Liskov Substitution Principle**: Subtypes must be substitutable for their base types
- **Interface Segregation Principle**: Clients should not depend on interfaces they don't use
- **Dependency Inversion Principle**: Depend on abstractions, not concretions

### 2.2 Class Design

- **Keep classes focused**: If a class exceeds 300-400 lines, consider refactoring
- **Favor composition over inheritance**: Use delegation and composition to share behavior
- **Make fields private**: Always use private fields with getters/setters when needed
- **Prefer immutability**: Use final fields, immutable collections, and Records (Java 16+)
- **Use meaningful names**: Class names should be nouns (DeviceMonitor, AlertProcessor)

### 2.3 Method Design

- **Keep methods short**: Ideally under 20 lines, maximum 50 lines
- **Do one thing**: Each method should have a single responsibility
- **Limit parameters**: Maximum 3-4 parameters; consider parameter objects for more
- **Use descriptive names**: Method names should be verbs (collectMetrics, validateThreshold)
- **Avoid flag arguments**: Split methods instead of using boolean flags

### 2.4 Exception Handling

- **Use specific exceptions**: Prefer specific exceptions over generic Exception or RuntimeException
- **Don't swallow exceptions**: Always log or handle exceptions appropriately
- **Use try-with-resources**: For AutoCloseable resources to prevent resource leaks
- **Document exceptions**: Use @throws Javadoc for checked exceptions
- **Fail fast**: Validate inputs early and throw exceptions immediately when invalid

---

## 3. Modern Java Features

### 3.1 Use Records (Java 16+)

Prefer records for immutable data carriers:

```java
// Good
public record SensorReading(String sensorId, double value, Instant timestamp) {}

// Avoid
public class SensorReading {
    private final String sensorId;
    private final double value;
    private final Instant timestamp;
    
    // constructor, getters, equals, hashCode, toString...
}
```

### 3.2 Stream API

- Use streams for collection processing when it improves readability
- Avoid excessive chaining; break complex streams into intermediate variables
- Use parallel streams judiciously; measure performance before using
- Prefer method references over lambdas when applicable

```java
// Good
List<String> criticalAlertNames = alerts.stream()
    .filter(Alert::isCritical)
    .map(Alert::getName)
    .toList();

// Avoid - too complex
alerts.stream().filter(a -> a.getSeverity() > 3).filter(a -> a.isActive())
    .map(a -> a.getName()).filter(n -> n.startsWith("CPU"))
    .sorted().limit(10).collect(Collectors.toList());
```

### 3.3 Optional

- Use Optional for return types when absence of value is expected
- Never use Optional for fields or method parameters
- Never call Optional.get() without checking isPresent()
- Use Optional's functional methods (map, flatMap, orElse, orElseThrow)

```java
// Good
public Optional<Device> findDeviceById(DeviceId id) {
    return deviceRepository.findById(id);
}

// Usage
Device device = findDeviceById(new DeviceId("node-42"))
    .orElseThrow(() -> new DeviceNotFoundException("node-42"));

// Avoid
public Optional<Device> findDeviceById(Optional<DeviceId> id) { // NO!
    return Optional.empty();
}
```

### 3.4 Use Modern Switch Expressions (Java 14+)

Prefer switch expressions over traditional switch statements. They are more concise, expression-oriented, and eliminate fall-through bugs.

```java
// Avoid - traditional switch statement with fall-through risk
String label;
switch (deviceStatus) {
    case ONLINE:
        label = "Online";
        break;
    case OFFLINE:
        label = "Offline";
        break;
    default:
        label = "Unknown";
}

// Good - switch expression, concise and exhaustive
String label = switch (deviceStatus) {
    case ONLINE -> "Online";
    case OFFLINE -> "Offline";
    default -> "Unknown";
};
```

When combined with sealed classes or enums, the compiler enforces exhaustiveness — no `default` branch needed:

```java
// Good - exhaustive switch over an enum, compiler catches missing cases
double threshold = switch (alertSeverity) {
    case CRITICAL -> 0.95;
    case WARNING -> 0.80;
    case INFO -> 0.60;
};
```

Use `yield` when a case requires multiple statements:

```java
double samplingRate = switch (nodeType) {
    case EDGE -> 1.0;
    case GATEWAY -> {
        double base = calculateBaseSamplingRate();
        yield base * 1.5;
    }
};
```

## 4. Testing Standards

### 4.1 Test Naming Conventions

Use descriptive, behavior-focused test names following this pattern:

**Pattern**: `methodName_stateUnderTest_expectedBehavior`

**Examples:**

```java
@Test
void calculateAverageCpuUsage_withMultipleReadings_returnsCorrectAverage() { }

@Test
void findDevice_whenDeviceIsOffline_throwsDeviceUnavailableException() { }

@Test
void sendCommand_withUnreachableDevice_returnsFalse() { }

@Test
void validateThreshold_withNegativeValue_returnsFalse() { }

@Test
void registerDevice_withDuplicateId_throwsIllegalArgumentException() { }
```

### 4.2 Test Structure (Arrange-Act-Assert)

Organize tests using the AAA pattern:

```java
@Test
void calculateAverageCpuUsage_withMultipleReadings_returnsCorrectAverage() {
    // Arrange
    List<MetricReading> readings = List.of(
        new MetricReading("cpu", 40.0),
        new MetricReading("cpu", 60.0)
    );
    MetricAggregator aggregator = new MetricAggregator();
    
    // Act
    double average = aggregator.calculateAverage(readings);
    
    // Assert
    assertEquals(50.0, average);
}
```

- **Arrange**: Set up test data and preconditions
- **Act**: Execute the method under test
- **Assert**: Verify the expected outcome

### 4.4 Test Independence

- Each test must run independently and in any order
- No shared mutable state between tests
- Clean up resources in @AfterEach methods
- Use test fixtures and builders for test data creation

```java
class DeviceServiceTest {
    private DeviceService deviceService;
    
    @BeforeEach
    void setUp() {
        deviceService = new DeviceService();
    }
    
    @AfterEach
    void tearDown() {
        // Clean up resources
    }
    
    @Test
    void test1() { }
    
    @Test
    void test2() { }  // Must not depend on test1
}
```

### 4.5 Mocking Guidelines

- Mock external dependencies (databases, APIs, file systems)
- Don't mock value objects or simple data structures
- Verify interactions on mocks only when behavior is critical
- Prefer fakes over mocks for complex dependencies

```java
@Test
void processAlert_withCriticalAlert_notifiesAlertDispatcher() {
    // Arrange
    AlertDispatcher alertDispatcher = mock(AlertDispatcher.class);
    AlertProcessor alertProcessor = new AlertProcessor(alertDispatcher);
    Alert alert = new Alert("node-01", Severity.CRITICAL);
    
    when(alertDispatcher.dispatch(any())).thenReturn(true);
    
    // Act
    alertProcessor.processAlert(alert);
    
    // Assert
    verify(alertDispatcher).dispatch(alert);
}
```

## 5. Documentation Standards

### 5.1 Javadoc

**Required:**
- All public classes and interfaces
- All public and protected methods
- Complex private methods

**Optional:**
- Getters and setters (unless they have side effects)
- Self-explanatory methods

```java
/**
 * Calculates the average metric value across all readings within the given time window.
 *
 * @param readings      the list of metric readings to aggregate
 * @param windowSeconds the time window in seconds to include readings from
 * @return the average metric value within the window
 * @throws IllegalArgumentException if readings is null or empty
 */
public double calculateAverage(List<MetricReading> readings, long windowSeconds) {
    // implementation
}
```

### 5.2 Comments

- **Explain why, not what**: Code should be self-explanatory; comments explain reasoning
- **Keep comments up to date**: Outdated comments are worse than no comments
- **Use TODO comments**: Mark incomplete work with `// TODO: description`
- **Avoid noise**: Don't comment obvious code

```java
// Good - explains WHY
// Using thread-local to avoid synchronization overhead when parsing timestamps from concurrent sensor streams
private static final ThreadLocal<DateFormat> TIMESTAMP_FORMAT =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss"));

// Bad - explains WHAT (obvious from code)
// This increments the counter by 1
counter++;
```

## 6. Common Patterns and Anti-Patterns

### 6.1 Builder Pattern for Complex Objects

```java
// Good - Builder pattern
Device device = Device.builder()
    .id("node-42")
    .hostname("rack-03.datacenter.local")
    .type(DeviceType.SERVER)
    .monitored(true)
    .build();

// Avoid - Constructor with many parameters
Device device = new Device("node-42", "rack-03.datacenter.local", DeviceType.SERVER, true,
                           null, null, LocalDateTime.now(), false);
```

### 6.2 Factory Pattern for Object Creation

```java
// Good - Factory method
public class CollectorFactory {
    public static MetricCollector createCollector(CollectorType type) {
        return switch (type) {
            case CPU -> new CpuMetricCollector();
            case MEMORY -> new MemoryMetricCollector();
            case NETWORK -> new NetworkMetricCollector();
        };
    }
}
```

### 6.3 Avoid God Objects

```java
// Avoid - God object doing everything
class SystemManager {
    void collectMetrics() { }
    void processAlerts() { }
    void sendNotification() { }
    void controlHardware() { }
    void updateDeviceInventory() { }
    void generateReport() { }
}

// Good - Separate responsibilities
class MetricCollector { void collectMetrics() { } }
class AlertProcessor { void processAlerts() { } }
class NotificationService { void sendNotification() { } }
class HardwareController { void controlHardware() { } }
class InventoryService { void updateDeviceInventory() { } }
```

### 6.4 Avoid Impl pattern

Avoid naming implementation classes with an `Impl` suffix. It adds noise without conveying intent and suggests the interface has only one real implementation — in which case the interface may not be needed at all.

```java
// Avoid - Impl suffix is meaningless
public interface MonitoringService { }
public class MonitoringServiceImpl implements MonitoringService { }

// Good - name describes what the implementation does
public interface MonitoringService { }
public class DefaultMonitoringService implements MonitoringService { }
public class CachedMonitoringService implements MonitoringService { }
public class SnmpMonitoringService implements MonitoringService { }
```

If you only ever have one implementation, consider dropping the interface entirely and using the concrete class directly:

```java
// Prefer - when no polymorphism is needed
public class MetricCollector {
    public MetricReading collect(String sensorId) { ... }
}
```

### 6.5 Prefer Value Objects over Plain Values

Wrap meaningful domain concepts in value objects instead of passing raw primitives or strings. This makes the code self-documenting, prevents mixing up parameters of the same type, and allows validation to live close to the data.

```java
// Avoid - plain values are easy to mix up and carry no meaning
public Report generateReport(String deviceId, String sensorId, double threshold) { }

// Good - value objects make intent explicit and prevent argument swap bugs
public Report generateReport(DeviceId deviceId, SensorId sensorId, Threshold threshold) { }
```

Use records to define value objects concisely:

```java
public record DeviceId(String value) {
    public DeviceId {
        Objects.requireNonNull(value, "DeviceId must not be null");
    }
}

public record Threshold(double value, Unit unit) {
    public Threshold {
        Objects.requireNonNull(unit, "unit must not be null");
        if (value < 0 || value > 100) throw new IllegalArgumentException("threshold must be between 0 and 100");
    }
}
```

Apply this when:
- A primitive is used to represent a domain concept (device id, sensor id, metric value, threshold)
- Two or more parameters of the same type appear in the same method signature
- Validation of a value is repeated across the codebase

### 6.6 Don't Use Exceptions for Flow Control

Exceptions signal unexpected, error-worthy conditions — not expected outcomes of business logic. Using them for control flow hides intent, hurts performance, and makes code harder to reason about.

```java
// Avoid - exception used to drive normal logic
public boolean isDeviceRegistered(String deviceId) {
    try {
        deviceRepository.findByIdOrThrow(deviceId);
        return true;
    } catch (DeviceNotFoundException e) {
        return false;
    }
}

// Good - use a method that expresses the question being asked
public boolean isDeviceRegistered(String deviceId) {
    return deviceRepository.existsById(deviceId);
}
```

```java
// Avoid - using exception to signal a predictable "not found" case in a loop
for (String sensorId : sensorIds) {
    try {
        SensorReading reading = collector.getLatestReading(sensorId);
        process(reading);
    } catch (SensorNotFoundException e) {
        // skip unknown sensors
    }
}

// Good - check before acting
for (String sensorId : sensorIds) {
    collector.findLatestReading(sensorId).ifPresent(this::process);
}
```

Reserve exceptions for situations that are truly exceptional: invalid state, contract violations, infrastructure failures. For expected absent values or conditional branching, use `Optional`, return types, or explicit checks.

## 7. Conclusion

These guidelines establish a foundation for consistent, maintainable Java development across our team. They are intended to be living standards that evolve with our needs and the Java ecosystem.

### Next Steps

- Review and discuss these guidelines as a team
- Set up automated tools (Checkstyle, SpotBugs, SonarQube)
- Create code templates and IDE configurations
- Schedule quarterly reviews to update practices

### Contributing to This Document

This is a living document. If you have suggestions for improvements:

1. Open a discussion with the team
2. Provide rationale and examples
3. Update this document after team consensus
4. Communicate changes to all team members

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Draft for Discussion
