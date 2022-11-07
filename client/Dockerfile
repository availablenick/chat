FROM node:16.18.0

ARG UID=1000
ARG GID=1000

WORKDIR /app

RUN userdel node && \
    groupadd -g ${GID} newgroup && \
    useradd -g ${GID} -u ${UID} -m newuser && \
    chown -R ${UID}:${GID} /app

USER newuser:newgroup

COPY --chown=newuser:newgroup package*.json .
RUN npm install
ENV PATH "$PATH:/app/node_modules/.bin"

COPY --chown=newuser:newgroup . .

EXPOSE 4200

CMD ["ng", "serve", "--open", "--host=0.0.0.0", "--port=4200"]
