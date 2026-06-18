from datetime import datetime, timezone
from src.models.analysis import RiskFinding, GrowthSignal, ExecutiveSummary, AnalysisResult
from src.ai.prompts import (SYSTEM_PROMPT, CITATION_INSTRUCTIONS, RISK_ASSESSMENT_PROMPT, 
                            GROWTH_SIGNALS_PROMPT, EXECUTIVE_SUMMARY_PROMPT, CHAT_QUERY_PROMPT)
from src.ai.gemini_client import GeminiClient
from src.rag.pipeline import vector_store, bm25_manager
from src.rag.retriever import HybridRetriever
from pydantic import BaseModel

class RisksResponse(BaseModel):
    risks: list[RiskFinding]

class GrowthResponse(BaseModel):
    growth_signals: list[GrowthSignal]

class DueDiligenceAnalyzer:
    def __init__(self):
        self.client = GeminiClient()
        self.retriever = HybridRetriever(vector_store, bm25_manager)
        
    def _format_context(self, results: list) -> str:
        ctx = ""
        for r in results:
            page_info = f"p.{r.page_number}" if r.page_number else ""
            section_info = f"§{r.section}" if r.section else ""
            parts = [p for p in [r.source_file, page_info, section_info] if p]
            source_str = " · ".join(parts)
            ctx += f"[Source: {source_str}]\n{r.text}\n\n"
        return ctx

    def analyze_documents(self, doc_ids: list[str]) -> AnalysisResult:
        # 1. Retrieve for Risks
        risk_query = "risk factors regulatory compliance customer concentration debt liability"
        risk_results = self.retriever.retrieve(risk_query, n_results=10, doc_filter=doc_ids)
        risk_context = self._format_context(risk_results)
        
        risk_prompt = RISK_ASSESSMENT_PROMPT.format(
            citation_instructions=CITATION_INSTRUCTIONS,
            context=risk_context
        )
        risks_data = self.client.generate_structured(risk_prompt, SYSTEM_PROMPT, RisksResponse)
        
        # 2. Retrieve for Growth
        growth_query = "revenue growth ARR NRR market expansion product roadmap geographic expansion"
        growth_results = self.retriever.retrieve(growth_query, n_results=10, doc_filter=doc_ids)
        growth_context = self._format_context(growth_results)
        
        growth_prompt = GROWTH_SIGNALS_PROMPT.format(
            citation_instructions=CITATION_INSTRUCTIONS,
            context=growth_context
        )
        growth_data = self.client.generate_structured(growth_prompt, SYSTEM_PROMPT, GrowthResponse)
        
        # 3. Retrieve for Summary
        summary_query = "executive summary business overview key metrics investment thesis"
        summary_results = self.retriever.retrieve(summary_query, n_results=10, doc_filter=doc_ids)
        summary_context = self._format_context(summary_results + risk_results[:3] + growth_results[:3])
        
        summary_prompt = EXECUTIVE_SUMMARY_PROMPT.format(
            citation_instructions=CITATION_INSTRUCTIONS,
            context=summary_context
        )
        summary_data = self.client.generate_structured(summary_prompt, SYSTEM_PROMPT, ExecutiveSummary)
        
        return AnalysisResult(
            document_ids=doc_ids,
            risks=risks_data.risks,
            growth_signals=growth_data.growth_signals,
            summary=summary_data,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

    async def answer_query(self, question: str, doc_ids: list[str]):
        results = self.retriever.retrieve(question, n_results=8, doc_filter=doc_ids)
        context = self._format_context(results)
        
        prompt = CHAT_QUERY_PROMPT.format(query=question, context=context)
        
        async for chunk in self.client.stream(prompt, SYSTEM_PROMPT):
            yield chunk
