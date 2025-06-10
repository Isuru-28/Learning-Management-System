FROM node

WORKDIR /app

COPY ./learning-management-frontend/package*.json ./

RUN npm install

COPY ./learning-management-frontend .

EXPOSE 8081

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]    