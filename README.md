# Omni Dev Platform

## Deployment Guide

This guide explains how to deploy the Omni Dev platform as a standalone application using Docker.

### Prerequisites

- Docker and Docker Compose installed on your server
- Git installed on your server
- Domain name pointing to your server (audneys.com)

### Deployment Steps

1. **Clone the repository**

```bash
mkdir -p /root/omnidev
cd /root/omnidev
git clone https://github.com/drpcoa/omnidev.git .
```

2. **Configure environment variables (optional)**

If you need to customize environment variables, create a `.env` file:

```bash
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgres://postgres:omnidev_password@db:5432/omnidev
SESSION_SECRET=your_secure_random_string_here
EOF
```

3. **Start the application**

```bash
docker-compose up -d
```

4. **Set up SSL certificates (recommended)**

For HTTPS support, you can use Let's Encrypt:

```bash
docker run --rm -it \
  -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  -v "$(pwd)/nginx/www:/var/www/html" \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/html \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d audneys.com
```

After obtaining certificates, update the Nginx configuration by uncommenting the HTTPS server block in `nginx/conf.d/omnidev.conf` and restart Nginx:

```bash
docker-compose restart nginx
```

5. **Access the application**

The application will be available at:
- http://audneys.com/OmniDev
- https://audneys.com/OmniDev (after setting up SSL)

### Maintenance

- **View logs**:
  ```bash
  docker-compose logs -f
  ```

- **Restart services**:
  ```bash
  docker-compose restart
  ```

- **Update the application**:
  ```bash
  git pull
  docker-compose down
  docker-compose up -d --build
  ```

- **Backup the database**:
  ```bash
  docker exec -t omnidev-db pg_dump -U postgres omnidev > backup.sql
  ```

- **Restore the database**:
  ```bash
  cat backup.sql | docker exec -i omnidev-db psql -U postgres -d omnidev
  ```
