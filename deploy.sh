#!/bin/bash
cd /var/www/arcane-city-frontend
git pull origin main
npm ci
npm run build
sudo systemctl reload nginx