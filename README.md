gphoto-webui
============

This is a duplicate and extension of the original gphoto-webui project.
The original project can be found here:
https://github.com/theonemule/gphoto-webui


<img src="/screenshots/screen1.png" width="200" height="400" />


1.) Power up your Raspberry Pi. Pull up a Terminal, logon through SSH, or whatever you do to get to a console.

2.) Update your Raspberry Pi

    sudo apt-get update
    sudo apt-get upgrade

Note: the "upgrade" command always seems to screw up my system, so you may want to skip that step, at least until Raspian upgrades itself properly without imploding.

3.) Install the following packages.

    sudo apt-get install imagemagick php5 php5-cli php5-imagick php5-json gphoto2 zip unzip exiv2

Note: You do not need a web server. In fact, I wouldn’t recommend it for this little app because this app will need more elevated permissions than the www-data user has. Configuring the server to run a user with elevated permissions might work, but not necessary. PHP has a built in development server that will work just fine and also run as the logged on user. 

> DON'T RUN THIS ON THE PUBLIC INTERNET. THIS IS NOT INTENDED FOR THAT, NOR IS IT SECURE! 

Note: If you have trouble getting gphoto2 working with your camera, try installing it from scratch.
http://whysohardtoget.blogspot.com/2013/05/compiling-gphoto2-252-with-raspberry-pi.html

4.) Download the gphoto-webui from from github. I suggest your home folder, or a writable folder.

    cd ~
    wget http://github.com/joelpereira/gphoto-webui/archive/webui.zip

5.) Extract the files into a directory

    unzip webui.zip

6.) In the console, cd to that directory

    cd gphoto-webui

7.) Start the php server. This will bind the server to port 8000 on all IP’s.

    cd bin
    ./gphoto-webui.sh

8.) Point your browser to http://x.x.x.x:8000/  (x.x.x.x is the IP if your Raspberry Pi)

