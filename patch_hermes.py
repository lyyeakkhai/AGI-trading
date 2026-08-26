import re

with open("services/hermes/orchestrator.py", "r") as f:
    orch = f.read()

orch = orch.replace("from services.hermes.proposal_client import ProposalClient", 
                    "from services.hermes.proposal_client import ProposalClient\nfrom services.hermes.research_client import ResearchClient\nfrom services.hermes.escalation_policy import should_escalate")

orch = orch.replace("self.proposal_client = ProposalClient()", 
                    "self.proposal_client = ProposalClient()\n        self.research_client = ResearchClient()")

process_opp_orig = """            # 1. Context Assembly
            context = await self.context_assembler.assemble(symbol, timeframe)
            
            # 2. LLM Reasoning
            proposal = await self.reasoning.evaluate(context)
            
            if proposal:
                # 3. Submit Proposal"""

process_opp_new = """            # 1. Context Assembly
            context = await self.context_assembler.assemble(symbol, timeframe)
            
            # 2. LLM Reasoning
            proposal = await self.reasoning.evaluate(context)
            
            if proposal:
                # Escalation Check
                regime = str(context.get("indicators", {}))
                if should_escalate(symbol, timeframe, proposal.confidence, regime):
                    logger.info(f"Escalating {symbol} to deep research")
                    deep_report = await self.research_client.trigger_deep_research(symbol, timeframe, str(context))
                    if deep_report:
                        context["deep_research_report"] = deep_report
                        proposal = await self.reasoning.evaluate(context)

            if proposal:
                # 3. Submit Proposal"""

orch = orch.replace(process_opp_orig, process_opp_new)

with open("services/hermes/orchestrator.py", "w") as f:
    f.write(orch)

with open("services/hermes/reasoning.py", "r") as f:
    rsn = f.read()

prompt_orig = """Evaluate the data and generate a trade proposal."""
prompt_new = """Evaluate the data and generate a trade proposal.
Deep Research Report: {json.dumps(context.get('deep_research_report'))}"""

rsn = rsn.replace(prompt_orig, prompt_new)

with open("services/hermes/reasoning.py", "w") as f:
    f.write(rsn)
