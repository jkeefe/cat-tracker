#!/bin/bash

echo "Starting bluetooth ..."
sudo service bluetooth status

echo "Starting node script ..."
sudo ./node_modules/.bin/forever start index.js

