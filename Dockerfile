FROM node:18 as base
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
EXPOSE 80