FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]