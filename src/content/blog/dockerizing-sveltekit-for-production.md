---
title: 'Dockerizing SvelteKit for Production: A Practical Guide to Lean Images'
slug: 'dockerizing-sveltekit-for-production'
description: 'A step-by-step guide to containerizing a SvelteKit application using Docker and multi-stage builds for a lean, production-ready image with Nginx.'
date: '2025-07-08'
published: true
tags: ['docker', 'sveltekit', 'nginx', 'deployment', 'ci-cd']
---

## The "It Works on My Machine" Dilemma

So you've poured hours into crafting a beautiful, snappy SvelteKit application. The components are perfect, the logic is sound, and it runs like a dream on your local machine. Now comes the million-dollar question: How do you get it from your laptop to the world, ensuring it runs just as reliably for your users?

This is where the classic "it works on my machine" problem haunts developers. Differences in operating systems, Node.js versions, and system dependencies can turn a smooth deployment into a nightmare.

Enter Docker. Docker allows us to package our application, along with all its dependencies, into a standardized, isolated unit called a container. This container can run anywhere, from a developer's machine to a production server, guaranteeing consistency. In this guide, we'll walk through creating a lean, production-ready Docker image for a SvelteKit application, leveraging the power of multi-stage builds.

## The Goal: A Lean, Secure Production Image

Our objective isn't just to get the app into a container. We want to create an image that is:

- **Small:** A smaller image is faster to pull from a registry and deploy.
- **Secure:** The final image should not contain our source code, build tools, or unnecessary dependencies.
- **Optimized:** We'll use a production-grade web server to serve our static files efficiently.

## The First Pass: A Simple (But Flawed) Dockerfile

Let's start with a basic approach. You might be tempted to write a Dockerfile like this:

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

While this works, it has major problems:

1. **Massive Image Size:** It bundles our entire source code, `node_modules` (including `devDependencies` like `vite`, `svelte`, and `@sveltejs/kit`), and build artifacts into the final image. This can easily result in an image over 1GB.
2. **Poor Security:** Shipping your source code and build tools in a production image is a security risk.
3. **Inefficient Caching:** A single `COPY . .` command means any file change invalidates the Docker layer cache, forcing a full `npm install` on every build.
4. **Wrong Server:** The `npm run preview` command runs a development server, which is not optimized or secure enough for production traffic.

## The Professional Approach: Multi-Stage Builds

A multi-stage build is the key to solving these problems. We use multiple `FROM` instructions in a single Dockerfile. Each `FROM` starts a new, temporary build stage. We can build our application in one stage and then copy only the necessary artifacts into a clean, final stage.

Here’s the game plan:

1. **Builder Stage:** A Node.js environment where we install dependencies and build our SvelteKit application.
2. **Runner Stage:** A lightweight Nginx web server that serves the static files produced by the builder stage.

### Step 1: The `.dockerignore` File

First, let's tell Docker what to ignore. This prevents unnecessary files from being sent to the Docker daemon, speeding up the build process. Create a `.dockerignore` file in your project root:

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

### Step 2: The Builder Stage

Let's define the first stage in our `Dockerfile`. We'll name it `builder`.

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

What's happening here?

- `FROM node:20-alpine AS builder`: We start with a lightweight Alpine Linux Node.js image and name this stage `builder`.
- `COPY package.json ...`: We copy only the package files first. Docker caches this layer, so `npm install` only re-runs if our dependencies change, not every time we change a source file.
- `COPY . .`: We then copy the rest of our source code.
- `RUN npm run build`: This compiles our SvelteKit app. The output, by default for the static adapter, will be in the `build/` directory.

### Step 3: The Runner Stage & Nginx Configuration

Now for the final stage. This stage will be our lean production image.

First, we need a configuration file for Nginx. This tells the server how to handle requests, and critically, how to support client-side routing in a Single Page Application (SPA).

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

The `try_files $uri $uri/ /index.html;` line is the magic here. It tells Nginx to first look for a file that matches the request URI. If not found, look for a directory. If that also fails, it serves `/index.html`. This allows SvelteKit's client-side router to take over and handle the route.

Now, let's add the runner stage to our `Dockerfile`:

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

- `FROM nginx:stable-alpine`: We use a very small, official Nginx image.
- `COPY nginx.conf ...`: We replace the default Nginx config with our own.
- `COPY --from=builder ...`: This is the core of the multi-stage build. We copy the contents of the `/app/build` directory from the `builder` stage into the Nginx web root directory in our new, clean stage.
- `CMD ["nginx", "-g", "daemon off;"]`: This is the standard command to run Nginx in the foreground, which is best practice for containers.

### Step 4: The Complete `Dockerfile`

Here is the final, complete `Dockerfile`:

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

## Building and Running Your Container

With all the files in place, open your terminal in the project root and run the build command:

```bash
# Build the Docker image and tag it as 'my-svelte-app'
docker build -t my-svelte-app .
```

Once the build is complete, you'll have a tiny, optimized Docker image ready to go. Let's run it:

```bash
# Run the container, mapping port 8080 on your host to port 80 in the container
docker run -p 8080:80 my-svelte-app
```

Now, open your browser and navigate to `http://localhost:8080`. You should see your SvelteKit application, served by Nginx, running beautifully.

## Conclusion

By using a multi-stage build, we've created a production-ready Docker image that is a fraction of the size of a naive build (often under 50MB vs. over 1GB). We've also enhanced security by excluding source code and build tools from the final image. This lean, efficient container is now ready for deployment on any cloud provider or server that supports Docker.

This pattern provides a solid foundation for your SvelteKit deployments, making them more reliable, scalable, and secure. From here, you can integrate this process into a CI/CD pipeline for fully automated builds and deployments. Happy containerizing!
