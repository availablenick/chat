FROM node:18.12.1

ARG UID=1000
ARG GID=1000

WORKDIR /app

RUN userdel node && \
    groupadd -g ${GID} newgroup && \
    useradd -g ${GID} -u ${UID} -m newuser && \
    chown -R ${UID}:${GID} /app

USER newuser:newgroup

COPY --chown=newuser:newgroup package*.json ./
RUN npm install
COPY --chown=newuser:newgroup . .

ENV PATH "$PATH:/app/node_modules/.bin"

EXPOSE 3000

CMD ["npm", "start"]
