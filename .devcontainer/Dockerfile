FROM node:20-bullseye

# Create app directory
WORKDIR /workspace

# Copy package manifests first for better caching
COPY package*.json ./

RUN npm ci --omit=dev || npm install

COPY . /workspace

ENV PATH /workspace/node_modules/.bin:$PATH

CMD ["/bin/bash"]
