#!/bin/bash

cd ~/git/gphoto-webui
/usr/bin/php5 -S 0.0.0.0:8000 >log/webui.out 2>log/webui.err &
echo $! > log/webui.pid
