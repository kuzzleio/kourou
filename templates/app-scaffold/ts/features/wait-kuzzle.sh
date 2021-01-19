#!/bin/sh

set -e

echo "[$(date)] - Waiting Kuzzle..."
while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo "[$(date)] - Still trying to connect to Kuzzle"
    sleep 5
done
