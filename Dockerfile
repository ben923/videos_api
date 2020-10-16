FROM node:12
WORKDIR ./videos_api
COPY ./videos_api/package.json .
RUN npm install
COPY ./videos_api .
# COPY ./database/init.sql /docker-entrypoint-initdb.d/init.sql