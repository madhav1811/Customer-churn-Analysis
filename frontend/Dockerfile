# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# In a production environment, we would build and serve with nginx
# But for this full-stack dev setup, we'll use Vite's dev server or preview
CMD ["npm", "run", "dev", "--", "--host"]
