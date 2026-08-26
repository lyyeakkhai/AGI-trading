import asyncio
import json
import logging
from typing import Any, Dict

from packages.config.settings import get_settings
import redis.asyncio as redis
from packages.config import get_settings
from services.hermes.context import ContextAssembler
from services.hermes.reasoning import ReasoningEngine
from services.hermes.proposal_client import ProposalClient
from services.hermes.memory_recorder import MemoryRecorder

logger = logging.getLogger(__name__)

class HermesOrchestrator:
    def __init__(self):
        self.settings = get_settings()
        self.redis = get_redis_client()
        self.stream_name = f"{self.settings.redis.key_prefix}opportunity.detected"
        self.consumer_group = "hermes_group"
        self.consumer_name = "hermes_worker_1"
        self.context_assembler = ContextAssembler()
        self.reasoning = ReasoningEngine()
        self.proposal_client = ProposalClient()
        self.memory = MemoryRecorder()

    async def initialize(self):
        try:
            await self.redis.xgroup_create(
                name=self.stream_name,
                groupname=self.consumer_group,
                mkstream=True
            )
        except Exception as e:
            if "BUSYGROUP" not in str(e):
                logger.error(f"Failed to create consumer group: {e}")

    async def process_opportunity(self, event_data: dict):
        try:
            symbol = event_data.get(b"symbol", b"").decode("utf-8")
            timeframe = event_data.get(b"timeframe", b"").decode("utf-8")
            
            if not symbol or not timeframe:
                logger.error("Missing symbol or timeframe in event")
                return

            logger.info(f"Processing opportunity for {symbol} {timeframe}")
            
            # 1. Context Assembly
            context = await self.context_assembler.assemble(symbol, timeframe)
            
            # 2. LLM Reasoning
            proposal = await self.reasoning.evaluate(context)
            
            if proposal:
                # 3. Submit Proposal
                decision = await self.proposal_client.submit(proposal)
                
                # 4. Episodic Memory
                await self.memory.record(context, proposal, decision)
                
        except Exception as e:
            logger.error(f"Error processing opportunity: {e}", exc_info=True)

    async def run(self):
        await self.initialize()
        logger.info(f"Hermes Orchestrator started listening on {self.stream_name}")
        
        while True:
            try:
                # Read from stream
                messages = await self.redis.xreadgroup(
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    streams={self.stream_name: ">"},
                    count=1,
                    block=5000
                )
                
                for stream, stream_messages in messages:
                    for message_id, message_data in stream_messages:
                        await self.process_opportunity(message_data)
                        await self.redis.xack(self.stream_name, self.consumer_group, message_id)
                        
            except asyncio.CancelledError:
                logger.info("Orchestrator shutting down")
                break
            except Exception as e:
                logger.error(f"Error reading from stream: {e}", exc_info=True)
                await asyncio.sleep(1)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    orchestrator = HermesOrchestrator()
    asyncio.run(orchestrator.run())
