FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build Vite frontend
RUN npm run build

# Expose server port
EXPOSE 4000

ENV PORT=4000
CMD ["npm", "start"]
