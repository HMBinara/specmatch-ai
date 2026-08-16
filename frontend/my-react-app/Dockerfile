# Stage 1: Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Network timeouts වලට resilience එක වැඩි කිරීමට config එකතු කිරීම
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom build to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]