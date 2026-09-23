FROM node:22-slim

# Install ImageMagick 7 from source dependencies + build tools
RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    pkg-config \
    libjpeg-dev \
    libwebp-dev \
    libpng-dev \
    libtiff-dev \
    && rm -rf /var/lib/apt/lists/*

# Install ImageMagick 7 binary from official release
RUN wget -q https://imagemagick.org/archive/binaries/magick -O /usr/local/bin/magick \
    && chmod +x /usr/local/bin/magick

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 3000

# Run the server using tsx (handles TypeScript + .ts imports natively)
CMD ["npx", "tsx", "server.ts"]
