#!/bin/bash
set -x 
set -u


cp -r ../server/ ../server.backup
mv ../server ../server-temp
jscoverage ../server-temp ../server --exclude=node_modules
cp -r ../server.backup/node_modules/ ../server/
mocha -R html-cov > coverage.html
rm -r ../server ../server-temp
mv ../server.backup ../server

chromium-browser coverage.html
