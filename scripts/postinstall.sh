#!/usr/bin/env bash

if [ -f templates.tgz ]; 
  then 
  tar xf templates.tgz
fi

echo """
Kourou send anonymous usage info to our open source analytics server Kepler to help us improve the product.
Set KUZZLE_ANALYTICS=false to disable this behavior.
"""