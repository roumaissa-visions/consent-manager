# Use the official Node.js image as base image
FROM node:lts

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

RUN git init


# Install app dependencies
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Ensure necessary permissions
RUN chown -R node:node /usr/src/app

# Command to run the application
CMD ["sh", "-c", "pnpm run build && pnpm run copyKeys && pnpm run start"]