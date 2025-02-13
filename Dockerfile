# Use a multi-stage build to optimize the image size
# Stage 1: Build
FROM node:14-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Expose the necessary port
EXPOSE 3000

# Set the entry point
CMD ["npm", "start"]
