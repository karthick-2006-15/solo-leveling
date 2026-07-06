# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Set Node environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
