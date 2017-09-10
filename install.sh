#!/usr/bin/env bash

verifyInstalled () {
  command -v $1 >/dev/null 2>&1 || { echo >&2 "You must install $1. Aborting."; exit 1; }
  echo "Verifying $1 is installed: OK"
}

printFinalHints() {
  echo "Your mongo database has been seeded with Goodneighbor production data"
  echo "However, this is Goodneighbor production data, not your data."
  echo "Now, you need to modify the running avatars so they are yours"
  echo "Using the admin UI is probably the easiest way to accomplish this"
  echo "To run the admin UI, you should look in the Dockerfile for all ENV variables that are necessary"
  echo "Pass them to node on startup like so: "
  echo "CONTENT_HYDRATION_INTERVAL_MILLISECONDS=120000 ADMIN_USERNAME='goodneighbor' ADMIN_PASSWORD='somepassword' AVATAR_CONFIG_API_KEY='CJSKCGdfvhdugef^DS%6drw7' CONFIG_UPDATE_URL='http://localhost:3100/avatars/config/' CONFIG_POLL_INTERVAL_MILLISECONDS=120000 GCS_API_ROOT='http://127.0.0.1:3100' FALLEN_AVATAR_RECOVERY_INTERVAL_MILLISECONDS=12000 GRAND_CENTRAL_STATION_PORT=3100 node grand-central-station.js"
  echo "Visit the Twitter Developer app and create your own apps (one for each avatar)"
  echo "Give them read and write access and generate their oAuth credentials"
  echo "When you have their auth credentials, replace the dummy data here with your own credentials"
  echo "Then configure all of the Twitter, scraper and timer settings to your liking"
  echo "Remember, if you feel the urge to ask for support, be sure to leave me alone"
  echo "This is free software. You're welcome for having it all."
  echo "If you want to run this in production for yourself you will need to invest some effort"
  echo "in figuring out how it works"
}

verifyInstalled node
verifyInstalled mongo
verifyInstalled mongorestore

echo "Loading Goodneighbor production data into your local mongo instance..."
mongorestore db-seeder/goodneighbor-production-data
LOAD_STATUS=$?
if [ $LOAD_STATUS -eq 0 ]; then
  echo "Success!"
else
  echo "Error loading data!" && exit 1;
fi

printFinalHints