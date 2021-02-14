FROM sirajul/php74-worker:latest

COPY /docker/php/worker.conf /etc/supervisor/conf.d/worker.conf

WORKDIR /var/www/html

RUN mkdir -p /var/www/html/storage/logs/
RUN touch /var/www/html/storage/logs/supervisor.log

COPY /docker/php/entrypoint.sh /entry-point.sh
RUN chmod +x /entry-point.sh

ENTRYPOINT ["/entry-point.sh"]
