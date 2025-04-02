FROM node:16.3.0-alpine

RUN mkdir -p /usr/src/app
RUN mkdir -p /var/uploadData
RUN mkdir -p /var/importLog
RUN mkdir -p /var/tempImportProgress
RUN mkdir -p /var/resourceUploads
RUN mkdir -p /var/maps
RUN mkdir -p /var/constantFile
WORKDIR /usr/src/app

COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production


# Expose the listening port of your app
EXPOSE 8041

# Show current folder structure in logs
RUN ls -al -R

CMD ["npm", "start"]

RUN chmod -R 777 /var/resourceUploads/
