#!/usr/bin/env bash

if [ -f templates.tgz ]; 
  then 
  tar xf templates.tgz
fi

echo """
This version of Kourou embed usage analytics.
It's fully anonymous and does not track your IP address or other personal information.
We use our custom analytics system Kepler, you can review the code here:
https://github.com/kuzzleio/kepler

If you want to turn it off, just run the following commands:
export KOUROU_ANALYTICS=false

To make it permanent, add the following line to your ~/.bashrc then source it to apply the changes:
export KOUROU_ANALYTICS=false
"""