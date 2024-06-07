# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.3.0

# Stage 1: Install dependencies and run tests
FROM node:${NODE_VERSION}-alpine AS test

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source files and run tests
COPY . .
RUN npm test || { echo 'Tests failed'; exit 1; }

# Stage 2: Build the production image
FROM node:${NODE_VERSION}-alpine AS prod

# Use production node environment by default
ENV NODE_ENV production

WORKDIR /usr/src/app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the source files
COPY . .

# Expose the port that the application listens on
EXPOSE 8080

# Run the application as a non-root user
USER node

# Run the application
CMD npm start
