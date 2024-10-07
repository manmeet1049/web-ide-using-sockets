# Use a Node.js base image
FROM node:22.9.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install necessary build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Install bash
RUN apt-get update && apt-get install -y bash

# Expose the server port
EXPOSE 9000

# Set the environment variable to use bash
ENV SHELL /bin/bash

# Command to start the app
CMD ["node", "index.js"]
