#!/bin/sh

set -e

tries=60
echo "[$(date)] - Waiting Kuzzle..."
echo ""

while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo -ne "\r[$(date)] - Still trying to connect to Kuzzle ($tries)"

    ((tries=tries-1))

    [ $tries -eq 0 ] && exit 1;

    sleep 1
done
