FROM nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

VOLUME [ "/dist" ]