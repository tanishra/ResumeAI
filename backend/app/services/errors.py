class ResumeAnalyzerError(Exception):
    error_code = "resume_analyzer_error"
    status_code = 500

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class ResumeExtractionError(ResumeAnalyzerError):
    error_code = "resume_extraction_failed"
    status_code = 422


class AnalyzerConfigurationError(ResumeAnalyzerError):
    error_code = "analyzer_configuration_error"
    status_code = 500


class UpstreamModelError(ResumeAnalyzerError):
    error_code = "upstream_model_error"
    status_code = 503


class PipelineExecutionError(ResumeAnalyzerError):
    error_code = "pipeline_execution_error"
    status_code = 500
