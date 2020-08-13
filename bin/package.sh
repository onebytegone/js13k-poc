#!/usr/bin/env bash

npm run build

echo ''
(cd dist && zip -r ../output.zip .)

echo ''
unzip -l output.zip

echo ''
ZIPPED_BYTES=$(stat -c %s output.zip)
echo "Packaged: ${ZIPPED_BYTES} bytes"
echo "Remaining: $((13312 - ${ZIPPED_BYTES})) bytes"
