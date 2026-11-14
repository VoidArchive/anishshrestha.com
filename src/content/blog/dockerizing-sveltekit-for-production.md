---
title: 'Dockerizing SvelteKit for Production: A Practical Guide to Lean Images'
slug: 'dockerizing-sveltekit-for-production'
description: 'A step-by-step guide to containerizing a SvelteKit app with Docker multi-stage builds, ending with a lean production image served by Nginx.'
date: '2025-07-08'
published: true
tags: ['docker', 'sveltekit', 'nginx', 'deployment', 'ci-cd']
---

## The "it works on my machine" dilemma

Your SvelteKit application runs well on your local machine. The next question is how to get it from your laptop to a server and have it run just as reliably for your users.

That is the classic "it works on my machine" problem. Differences in operating systems, Node.js versions, and system dependencies can break a deployment that worked locally.

Docker packages the application, along with all its dependencies, into a standardized, isolated unit called a container. The container runs the same way on a developer's machine and on a production server. This guide builds a lean, production-ready Docker image for a SvelteKit application using a multi-stage build.

## The goal: a lean, secure production image

We want three things from the image. It should be small, because a smaller image is faster to pull from a registry and deploy. It should be secure, so the final image should not contain our source code, build tools, or unnecessary dependencies. And it should serve our static files efficiently, which means a production-grade web server.

## The first pass: a simple (but flawed) Dockerfile

Start with the basic approach. A first Dockerfile often looks like this:

```dockerfile
# The "Don't Do This" Example
FROM node:20-slim

WORKDIR /app

# Copy everything
COPY . .

# Install ALL dependencies, including devDependencies
RUN npm install

# Build the app
RUN npm run build

# Expose the port and run the preview server
EXPOSE 4173
CMD ["npm", "run", "preview"]
```

This works, but it has four problems:

1. The image is massive. It bundles our entire source code, `node_modules` (including `devDependencies` like `vite`, `svelte`, and `@sveltejs/kit`), and build artifacts into the final image, which can easily come to over 1GB.
2. Shipping your source code and build tools in a production image is a security risk.
3. Caching is inefficient. A single `COPY . .` command means any file change invalidates the Docker layer cache and forces a full `npm install` on every build.
4. It runs the wrong server. The `npm run preview` command runs a development server, which is not optimized or secure enough for production traffic.

## The professional approach: multi-stage builds

A multi-stage build solves these problems. We use multiple `FROM` instructions in a single Dockerfile, and each `FROM` starts a new, temporary build stage. We build the application in one stage and then copy only the necessary artifacts into a clean, final stage.

There are two stages:

1. The builder stage is a Node.js environment where we install dependencies and build our SvelteKit application.
2. The runner stage is a lightweight Nginx web server that serves the static files produced by the builder stage.

### Step 1: the `.dockerignore` file

First, tell Docker what to ignore. This keeps unnecessary files from being sent to the Docker daemon, which speeds up the build. Create a `.dockerignore` file in your project root:

```
# .dockerignore

.DS_Store
.env
.env.*
.git
.github
.svelte-kit/
.vscode/
build/
node_modules/
npm-debug.log*
README.md
```

### Step 2: the builder stage

The first stage in our `Dockerfile` is named `builder`.

```dockerfile
# Dockerfile

# ---- Builder Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build
```

Line by line:

- `FROM node:20-alpine AS builder` starts from a lightweight Alpine Linux Node.js image and names this stage `builder`.
- `COPY package.json ...` copies only the package files first. Docker caches this layer, so `npm install` only re-runs when our dependencies change and is skipped when we only change a source file.
- `COPY . .` then copies the rest of our source code.
- `RUN npm run build` compiles our SvelteKit app. With the static adapter the output goes to the `build/` directory by default.

### Step 3: the runner stage & Nginx configuration

The final stage is our lean production image.

Nginx needs a configuration file first. It tells the server how to handle requests and, critically, how to support client-side routing in a Single Page Application (SPA).

Create a file named `nginx.conf`:

```nginx
# nginx.conf

server {
    listen 80;
    server_name localhost;

    # Root directory where SvelteKit build output is located
    root /usr/share/nginx/html;
    index index.html;

    # Handle SPA routing
    # If a file or directory is not found, fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Add headers for security and caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

The `try_files $uri $uri/ /index.html;` line does the important work. It tells Nginx to first look for a file that matches the request URI, then for a directory, and if both fail to serve `/index.html`. SvelteKit's client-side router then takes over and handles the route.

Now add the runner stage to our `Dockerfile`:

```dockerfile
# Dockerfile (continued)

# ---- Runner Stage ----
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- `FROM nginx:stable-alpine` uses a very small, official Nginx image.
- `COPY nginx.conf ...` replaces the default Nginx config with our own.
- `COPY --from=builder ...` is the core of the multi-stage build. It copies the contents of the `/app/build` directory from the `builder` stage into the Nginx web root directory in our new, clean stage.
- `CMD ["nginx", "-g", "daemon off;"]` is the standard command to run Nginx in the foreground, which is best practice for containers.

### Step 4: the complete `Dockerfile`

Here is the complete `Dockerfile`:

```dockerfile
# ---- Builder Stage ----
# Use a lightweight Node.js image on Alpine Linux
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the SvelteKit application for production
# This assumes you are using @sveltejs/adapter-static
RUN npm run build

# ---- Runner Stage ----
# Use a lightweight Nginx image on Alpine Linux
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage to the Nginx web root
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# The command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
```

## Building and running your container

With all the files in place, open your terminal in the project root and run the build command:

```bash
# Build the Docker image and tag it as 'my-svelte-app'
docker build -t my-svelte-app .
```

When the build finishes you have a small Docker image. Run it:

```bash
# Run the container, mapping port 8080 on your host to port 80 in the container
docker run -p 8080:80 my-svelte-app
```

Now open your browser and go to `http://localhost:8080`. You should see your SvelteKit application, served by Nginx.

## Conclusion

The multi-stage build gives us a production-ready Docker image that is a fraction of the size of the naive build, often under 50MB against over 1GB. The final image also leaves out the source code and build tools, which is better for security, and it can be deployed on any cloud provider or server that supports Docker.

From here, you can put this process into a CI/CD pipeline for fully automated builds and deployments.
