FROM node:20-bullseye-slim

# Install build tools for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install dependencies and rebuild native modules inside the container
RUN npm install && npm rebuild

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]