FROM node:20

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (expo CLI mới đã tích hợp trong expo package)
RUN npm install

# Copy source code
COPY . .

EXPOSE 19000 19001 19002 8081

# Start Expo dev server
CMD ["npx", "expo", "start"]
