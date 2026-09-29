# Deployment Guide

This guide describes how to deploy the GeoNiti platform to a single cloud VM (e.g., AWS EC2, DigitalOcean Droplet, Azure VM).

## Prerequisites
- A cloud VM (Ubuntu 22.04 LTS recommended) with at least 4GB RAM and 2 vCPUs.
- Docker and Docker Compose installed.
- Git installed.
- A registered domain name pointing to the VM's public IP address (for HTTPS).

## Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/organization/geoniti.git
   cd geoniti
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the project root:
   ```env
   DB_USER=geoniti_user
   DB_PASSWORD=secure_database_password
   DB_NAME=geoniti
   JWT_SECRET=generate_a_secure_random_string_here
   OPENAI_API_KEY=your_openai_api_key_if_applicable
   ```

3. **Build and Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Initialize Database and Seed Data**
   ```bash
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec core-api npm run db:migrate
   
   # Seed the database
   docker-compose -f docker-compose.prod.yml exec core-api npm run db:seed
   ```

5. **Setup HTTPS with Certbot and Nginx (Reverse Proxy)**
   GeoNiti currently exposes the frontend on port 80. To secure this with HTTPS:
   
   - Install Nginx and Certbot on the host machine:
     ```bash
     sudo apt update
     sudo apt install nginx certbot python3-certbot-nginx
     ```
   
   - Configure Nginx as a reverse proxy for the frontend (port 80), core-api (port 3000), and ai-service (port 8000). Create `/etc/nginx/sites-available/geoniti`:
     ```nginx
     server {
         server_name geoniti.yourdomain.com;
         
         location / {
             proxy_pass http://localhost:80;
         }
         
         location /api/ {
             proxy_pass http://localhost:3000/;
         }
     }
     ```
   
   - Enable the site and obtain a certificate:
     ```bash
     sudo ln -s /etc/nginx/sites-available/geoniti /etc/nginx/sites-enabled/
     sudo certbot --nginx -d geoniti.yourdomain.com
     ```

## Environment Checklist
- [ ] Strong database credentials set.
- [ ] Secure `JWT_SECRET` generated (e.g., via `openssl rand -base64 32`).
- [ ] Ports 80 and 443 open in the cloud firewall.
- [ ] External access to ports 3000, 8000, and 5432 blocked by the firewall (only accessed locally or via Nginx).
- [ ] HTTPS enabled via Let's Encrypt.
