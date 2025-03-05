# Stage 1: Build the React app with Vite
FROM node:lts-alpine AS client-builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the React app with Node.js
FROM node:lts-alpine

WORKDIR /app

# Copy the built React app from the client-builder stage
COPY --from=client-builder /app/dist ./dist

# Debug: List files in the build context
RUN ls -la

# Copy the Node.js server file
COPY server.cjs ./

# Install production dependencies
RUN npm install express

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.cjs"]