# Lets MCP directories start the server and read its list of tools. The tools themselves need Windows and the game:
# see README.md for a real installation.
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm ci --no-audit --no-fund && npm run build:core
ENV MILIASTRA_WORKSPACE=/app/workspace MILIASTRA_ALLOW_LIVE_WRITE=0
CMD ["node", "src/server.mjs"]
