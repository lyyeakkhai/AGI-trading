with open("docker-compose.yml", "r") as f:
    content = f.read()

tradingagents_str = """
  tradingagents:
    build:
      context: .
      dockerfile: infrastructure/docker/tradingagents.Dockerfile
    environment:
      - APP_ENV
      - TRADING_MODE
      - TRADINGAGENTS_SERVICE_TOKEN
      - LLM_GATEWAY_KEY
    networks:
      - trading-net

  postgres:"""

content = content.replace("\n  postgres:", tradingagents_str)
with open("docker-compose.yml", "w") as f:
    f.write(content)
