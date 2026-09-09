import asyncio
from packages.domain.enums import ExperimentCategory
from packages.domain.experiment import HypothesisConfig, CreateExperimentRequest
from services.research.service import ResearchService
from packages.database.engine import get_db_session

async def seed():
    async for session in get_db_session():
        svc = ResearchService(session)
        req = CreateExperimentRequest(
            title="BTC 4H Breakout With Volume Confirmation",
            description="Testing if volume spikes above 2x MA confirm breakouts effectively.",
            category=ExperimentCategory.BREAKOUT,
            hypothesis=HypothesisConfig(
                statement="Breakouts accompanied by volume > 2x the 20-period moving average have a higher win rate and profit factor.",
                rationale="High volume during a breakout indicates strong institutional participation and demand, reducing the likelihood of a fakeout.",
                expected_behavior="The strategy should exhibit a win rate > 55% and a profit factor > 1.5, significantly outperforming unfiltered breakouts.",
                assumptions=["Spot market execution", "Liquid assets only (BTC/ETH)"],
                invalidation_criteria=["Win rate < 45%", "Net return < 0 after slippage and fees"]
            ),
            tags=["btc", "breakout", "volume"]
        )
        exp = await svc.create_experiment(req)
        print(f"Created seed experiment: {exp.experiment_id}")
        return exp

if __name__ == "__main__":
    asyncio.run(seed())
