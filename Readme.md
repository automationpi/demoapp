
### Step 1: Set Up Docker Compose

Create a `docker-compose.yml` file to set up Grafana, the OpenTelemetry Collector, and a backend storage (like Prometheus for metrics and Jaeger for traces).

```yaml
version: '3.7'

services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
      - "14250:14250"
      - "6831:6831/udp"
      - "6832:6832/udp"

  otel-collector:
    image: otel/opentelemetry-collector:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "55681:55681" # OTLP HTTP receiver
```

### Step 2: Prometheus Configuration

Create a `prometheus.yml` file to configure Prometheus.

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8888']
```

### Step 3: OpenTelemetry Collector Configuration

Create an `otel-collector-config.yaml` file to configure the OpenTelemetry Collector.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  prometheus:
    endpoint: "0.0.0.0:8888"
  logging:
    logLevel: debug
  jaeger:
    endpoint: "http://jaeger:14268/api/traces"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging, jaeger]
    metrics:
      receivers: [otlp]
      exporters: [logging, prometheus]
```

### Step 4: Run Docker Compose

Run the following command to start the services:

```bash
docker-compose up
```

### Step 5: Update `instrumentation.ts`

Update your `instrumentation.ts` to point to the local OpenTelemetry Collector.

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/otlp-exporter-trace';
import { OTLPMetricsExporter } from '@opentelemetry/otlp-exporter-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'backstage-app',
});

const traceExporter = new OTLPTraceExporter({ url: 'http://localhost:4317' });
const metricsExporter = new OTLPMetricsExporter({ url: 'http://localhost:4317' });

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricsExporter,
    exportIntervalMillis: 60000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.configureTracerProvider((provider) => {
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
});
sdk.configureMeterProvider((provider) => {
  provider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }));
});

sdk.start().then(() => {
  console.log('OpenTelemetry SDK started');
}).catch((error) => {
  console.error('Error starting OpenTelemetry SDK', error);
});

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => {
    console.log('OpenTelemetry SDK shut down');
  }).catch((error) => {
    console.error('Error shutting down OpenTelemetry SDK', error);
  });
});
```

### Step 6: Start Your Backstage App

Run your Backstage app with the instrumentation. The telemetry data should be sent to the OpenTelemetry Collector, which forwards it to Prometheus for metrics and Jaeger for traces.

### Step 7: Access Grafana and Jaeger

- **Grafana**: Open your browser and go to `http://localhost:3000`. Log in with the default credentials (`admin`/`admin`) and configure data sources to include Prometheus.
- **Jaeger**: Open your browser and go to `http://localhost:16686` to view traces.

### Notes:

- Ensure all Docker containers are running and there are no port conflicts.
- You might need to configure Grafana to use Prometheus as a data source and create dashboards to visualize the metrics.
- Jaeger should automatically display the traces sent from your application.

This setup allows you to test your OpenTelemetry instrumentation locally with Grafana for metrics and Jaeger for traces.
