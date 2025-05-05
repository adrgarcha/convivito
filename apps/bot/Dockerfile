FROM oven/bun:latest

WORKDIR /app

# Copy package files for better caching
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Make sure the application port is exposed
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["bun", "start"]
