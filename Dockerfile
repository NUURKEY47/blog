FROM node:20

# Set working directory
WORKDIR /home/app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose app port
EXPOSE 3000

# Start app
CMD ["node", "index.js"]
