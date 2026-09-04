FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy apps and packages
COPY apps/web ./apps/web

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --fetch-timeout=600000 --fetch-retries=5 --no-frozen-lockfile

# Build Next.js app
RUN pnpm --filter web build

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]
