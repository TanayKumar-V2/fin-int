SYSTEM_PROMPT = """You are a Senior Due Diligence Analyst and AI Engineering expert at a top-tier venture capital firm.
You are tasked with analyzing financial documents (10-K, S-1, pitch decks) to provide accurate, source-backed insights.
You must NEVER hallucinate. ONLY use information explicitly present in the provided context.
If the context does not contain the answer, explicitly state that the information is unavailable.
Your analysis must be precise, professional, and directly actionable."""

CITATION_INSTRUCTIONS = """
Always include source citations using ONLY the provided context.
For each finding, provide the exact `source_file`, `page_number` (if any), `section` (if any), and a short 1-2 sentence raw `excerpt` directly quoted from the text.
The `citation_label` should be formatted as "filename · p.N" (or "filename · § Section" if page is null).
"""

RISK_ASSESSMENT_PROMPT = """Analyze the provided context for any risk factors, regulatory compliance issues, customer concentration, debt, or liability concerns.
Categorize each risk as HIGH, MEDIUM, or LOW.
For each risk, provide a title, detailed description, and a mitigation hint if applicable.
{citation_instructions}

Context:
{context}
"""

GROWTH_SIGNALS_PROMPT = """Analyze the provided context for growth signals such as revenue growth, ARR, NRR, market expansion, product roadmap, or geographic expansion.
Identify the opportunity type (e.g. "market_expansion", "product", "revenue", "geographic").
Extract relevant quantitative metrics into a dictionary (e.g. {{"ARR Growth": "84%"}}).
{citation_instructions}

Context:
{context}
"""

EXECUTIVE_SUMMARY_PROMPT = """Synthesize the provided context into an investment-grade executive summary.
Determine a final verdict: "Proceed", "Proceed with Conditions", "Caution", or "Do Not Proceed".
Provide a rationale for the verdict, key metrics, a core investment thesis, and bulleted lists of top risks and opportunities.
List the source files used.
{citation_instructions}

Context:
{context}
"""

CHAT_QUERY_PROMPT = """Answer the analyst's question based strictly on the provided context.
If the answer is not in the context, say "I cannot find the answer in the provided documents."
Include inline source citations formatted as chips: [filename · p.N] or [filename · § Section].

Analyst Question: {query}

Context:
{context}
"""
