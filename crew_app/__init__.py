import os

# Disable CrewAI/OpenTelemetry export so local runs do not block on telemetry.
os.environ.setdefault("CREWAI_DISABLE_TELEMETRY", "true")
os.environ.setdefault("OTEL_SDK_DISABLED", "true")
