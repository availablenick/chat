FROM php:7.4-cli

ARG UID=1000
ARG GID=1000

WORKDIR /app

RUN groupadd -g ${GID} newgroup && \
	useradd -g ${GID} -u ${UID} newuser -m && \
	chown newuser:newgroup /app

COPY --from=composer:2.4.1 /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get -y install libpq-dev libzip-dev libpng-dev libjpeg62-turbo-dev unzip vim

RUN docker-php-ext-install pdo_pgsql && \
	docker-php-ext-configure gd --with-jpeg && \
	docker-php-ext-install gd && \
	docker-php-ext-install zip

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y nodejs

RUN npm install cross-env -g

USER newuser
RUN	composer global require laravel/installer
ENV PATH "$PATH:/home/newuser/.composer/vendor/bin"

COPY --chown=newuser:newgroup package*.json ./
RUN npm install
COPY --chown=newuser:newgroup . ./
RUN composer install

EXPOSE 5000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=5000"]
