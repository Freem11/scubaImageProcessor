FROM node:22-slim

# Install ImageMagick and JPEG/WebP support
RUN apt-get update && apt-get install -y \
    imagemagick \
    libmagickcore-6.q16-6-extra \
    libjpeg-dev \
    libwebp-dev \
    libpng-dev \
    libtiff-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 3000

# Run the server using tsx (handles TypeScript + .ts imports natively)
CMD ["npx", "tsx", "server.ts"]
