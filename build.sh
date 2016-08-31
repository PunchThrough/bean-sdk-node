#!/usr/bin/env bash

BEAN_ARDUINO_CORE="bean-arduino-core-2.0.0.tar.gz"

./node_modules/.bin/babel src -d build/ &&
cp -R src/resources/ build/resources/ &&
tar -xzvf "build/resources/${BEAN_ARDUINO_CORE}" -C build/resources/ &&
rm "build/resources/${BEAN_ARDUINO_CORE}" &&
echo "Build Complete!"
