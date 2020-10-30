#!/bin/bash

set -e

# Create the folder where will be stored snapshots
mkdir -p /tmp/snapshots
chown -R elasticsearch:elasticsearch /tmp/snapshots

# Launch the kuzzle stack
docker-compose -f features/docker/docker-compose.yml up -d

echo "[$(date --rfc-3339 seconds)] - Starting Kuzzle..."
while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo "[$(date --rfc-3339 seconds)] - Still trying to connect to Kuzzle"
    sleep 5
done
