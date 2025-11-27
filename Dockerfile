# Use the official Node.js 20 Alpine image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema for client generation
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy application source code
COPY server.js ./
COPY src ./src

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "server.js"]
