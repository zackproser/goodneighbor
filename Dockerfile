FROM node:boron

LABEL maintainer "zackproser@gmail.com"

WORKDIR /app

ADD Helpers/ Helpers/

ADD good-neighbor-clustered/ good-neighbor-clustered/

#Suppress excessive NPM output - which currently defaults to info level
ENV NPM_CONFIG_LOGLEVEL warn

RUN cd good-neighbor-clustered/ && npm i

ADD grand-central-station/ grand-central-station/

RUN cd grand-central-station && npm i

RUN cd grand-central-station/goodneighbor-admin-ui/ && npm i && npm run build

RUN cp -r grand-central-station/goodneighbor-admin-ui/dist grand-central-station/dist

ENV ROLLBAR_ACCESS_TOKEN='4fd9a71ecf524a12b4439dacc537f682'

ENV DEVELOPMENT_MACHINE_HOSTNAME='Zacharys-MacBook-Pro.local'

#Username for HTTP basic auth
ENV ADMIN_USERNAME='goodneighbor'

#Password for HTTP basic auth
ENV ADMIN_PASSWORD='qde786DGWZDSYDASYUDGzd2E7F6WE'

ENV AVATAR_CONFIG_API_KEY='qde786DGWZDSYDASYUDGzd2E7F6WE^DS%6drw7'

ENV CONFIG_UPDATE_URL='http://localhost:3100/avatars/config/'

ENV CONFIG_POLL_INTERVAL_MILLISECONDS=120000

#Port that the manager application will listen on
ENV GRAND_CENTRAL_STATION_PORT=3100

ENV GCS_API_ROOT='http://127.0.0.1:3100'

ENV FALLEN_AVATAR_RECOVERY_INTERVAL_MILLISECONDS=12000

ENV GRAND_CENTRAL_STATION_PORT=3100

ENTRYPOINT ["node", "grand-central-station/grand-central-station.js"]

#ENTRYPOINT ["systemctl", "start", "goodneighbor.service"]
