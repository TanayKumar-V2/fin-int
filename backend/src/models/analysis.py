from pydantic import BaseModel
from enum import Enum
from typing import Optional

class RiskLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class SourceCitation(BaseModel):
    source_file: str
    page_number: int | None = None
    section: str | None = None
    excerpt: str
    citation_label: str

class RiskFinding(BaseModel):
    title: str
    description: str
    risk_level: RiskLevel
    confidence: float
    sources: list[SourceCitation]
    mitigation_hint: str | None = None

class GrowthSignal(BaseModel):
    title: str
    description: str
    opportunity_type: str
    confidence: float
    metrics: dict[str, str]
    sources: list[SourceCitation]

class ExecutiveSummary(BaseModel):
    company_name: str
    verdict: str
    verdict_rationale: str
    key_metrics: dict[str, str]
    investment_thesis: str
    top_risks: list[str]
    top_opportunities: list[str]
    sources_used: list[str]

class AnalysisResult(BaseModel):
    document_ids: list[str]
    risks: list[RiskFinding]
    growth_signals: list[GrowthSignal]
    summary: ExecutiveSummary
    query: str | None = None
    generated_at: str
