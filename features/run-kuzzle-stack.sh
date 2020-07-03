#!/bin/bash

set -e

docker-compose -f features/docker/docker-compose.yml up -d

echo "[$(date --rfc-3339 seconds)] - Starting Kuzzle..."
while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo "[$(date --rfc-3339 seconds)] - Still trying to connect to Kuzzle"
    sleep 5
done
