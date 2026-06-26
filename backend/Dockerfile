FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Dummy URL so `prisma generate` (run via postinstall) can process the config.
# No connection is made during generate — this is overridden at runtime by docker-compose.
ENV DATABASE_URL=postgresql://x:x@localhost/x

RUN npm install

COPY . .

EXPOSE 4000

# tsx runs TypeScript directly — avoids the Prisma 7 generated client issue
# where compiled .js files still reference .ts extensions internally.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]
