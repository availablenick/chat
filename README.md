# Chat application
A simple chat application

## Prerequisites
You need to install [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

## Getting started
Run:

```
$ docker compose up
```

By default, the application uses ports 3000, 4200 and 5000, but it is possible to change them by setting the environment variables `$WS_SERVER_PORT`, `$CLIENT_PORT` and `$HTTP_SERVER_PORT`, respectively.

## Tests
To run the tests for the HTTP server, run:

```
$ docker compose exec http-server php artisan test
```

To run the tests for the WebSocket server, run:

```
$ docker compose exec ws-server node run test
```
