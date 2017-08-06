FROM mongo

LABEL maintainer "zackproser@gmail.com"

COPY ./goodneighbor-production-data/ goodneighbor-production-data/

COPY ./start.sh start.sh

RUN chmod +x ./start.sh

ENTRYPOINT ["./start.sh"]