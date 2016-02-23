gphoto-webui
============

This started out as an extension of the original gphoto-webui project, but it has become much more, including a rewrite.
The original project can be found here:
https://github.com/theonemule/gphoto-webui


<img src="/screenshots/screen1.png" width="200" height="400" />


1. Install the following packages.

    sudo apt-get install imagemagick php5 php5-cli php5-imagick php5-json zip unzip exiv2

Note: You do not need a web server. In fact, I wouldn’t recommend it for this little app because this app will need more elevated permissions than the www-data user has. Configuring the server to run a user with elevated permissions might work, but not necessary. PHP has a built in development server that will work just fine and also run as the logged on user. 

> DON'T RUN THIS ON THE PUBLIC INTERNET. THIS IS NOT INTENDED FOR THAT AND IS NOT SECURE! 

2. Install latest gphoto2 (v2.5.9+). I recommend using the gphoto2-updater script here:

    https://github.com/gonzalo/gphoto2-updater

3. Download the gphoto-webui from from github. I suggest your home folder, as it will extract a gphoto-webui folder.

    cd ~
    wget http://github.com/joelpereira/gphoto-webui/dist/gphoto-webui.zip
    unzip webui.zip

4. Start the php server. This will bind the server to port 8000 on all IP’s.

    cd gphoto-webui/bin; ./gphoto-webui.sh

5. Point your browser to http://x.x.x.x:8000/  (x.x.x.x is the IP if your Raspberry Pi)

Enjoy!
