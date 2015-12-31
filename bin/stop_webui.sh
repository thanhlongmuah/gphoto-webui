#!/bin/bash

cd ~/git/gphoto-webui
PID=`cat ./log/webui.pid`

kill $PID

rm -f ./log/webui.pid

