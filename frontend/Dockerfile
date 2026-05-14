FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# IMPORTANT: build production app
RUN npm run build

# serve static build
RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]