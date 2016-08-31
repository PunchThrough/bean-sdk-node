#!/usr/bin/env bash

BEAN_ARDUINO_CORE="bean-arduino-core-2.0.0"
BEAN_ARDUINO_CORE_TARBALL="${BEAN_ARDUINO_CORE}.tar.gz"

./node_modules/.bin/babel src -d build/ &&
cp -R src/resources/ build/resources/ &&
tar -xzvf "build/resources/${BEAN_ARDUINO_CORE_TARBALL}" -C build/resources/ &&
cp src/resources/platform.local.txt "build/resources/${BEAN_ARDUINO_CORE}/hardware/LightBlue-Bean/bean/avr/"
rm "build/resources/${BEAN_ARDUINO_CORE_TARBALL}" &&
echo "Build Complete!"
