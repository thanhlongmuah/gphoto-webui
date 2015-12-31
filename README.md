gphoto-webui
============

This is a duplicate and extension of the original gphoto-webui project.
The original project can be found here:
https://github.com/theonemule/gphoto-webui

The reason I wrote this was simple: I wanted a remote control for my DSLR. That way, I can snap photos while I was in front of the camera from my smartphone and review them after the fact. I’m somewhat of a shutter bug in addition to being a tech geek. I could have bought a fancy dongle and installed an app on my phone to get the same sort of behavior, but I already had a Raspberry Pi (RasPi), and thought, “What if I could use that little mini computer to control my DSLR, then use my phone as remote?” Something like this maybe?

[Smartphone] >-WiFi-< [RasPI] >—USB—< [Camera]

gphoto2 is a CLI tool for doing things on many different models of cameras from all kinds of manufacturers, including Canon. All it needed was a way to control gphoto from my smartphone. I could use an SSH shell or a remote desktop, but where’s the fun in that? I applied some PHP, HTML, and JavaScript magic to make it all happen so any device with a web browser can control the camera as a remote control. I simply wrote a web based front-end for gphoto that is mobile friendly and posted it to GitHub for all to use, modify, and enjoy.

I’m using a RasPi model “B” (512 MB), but there’s no reason this wouldn’t work on model “A” or another box using Debian or Ubuntu Linux. I also have a WiFi adapter on my RasPi. Mobile WiFi might be challenge… You could “tether” your RasPi to your phone or tablet, or your could set up your RasPi as a WiFi AP too. My phone and tablet both support tethering, so I just use that.

Also, the RasPi needs power, and it doesn’t have a battery. It requires a 5v 1000ma DC connection to work. This isn’t to hard to reproduce with off the shelf batteries and a little McGyvering. There’s also after-market battery packs for the RasPi too.

Anyways, here’s how to make it work…

1.) Power up your Raspberry Pi. Pull up a Terminal, logon through SSH, or whatever you do to get to a console.

2.) Update your Raspberry Pi

sudo apt-get update
sudo apt-get upgrade

Note: the "upgrade" command always seems to screw up my system, so you may want to skip that step, at least until Raspian upgrades itself properly without imploding.

3.) Install the following packages.

sudo apt-get install imagemagick php5 php5-cli php5-imagick gphoto2 zip unzip exiv2

Note: You do not need a web server. In fact, I wouldn’t recommend it for this little app because this app will need more elevated permissions than the www-data user has. Configuring the server to run a user with elevated permissions might work, but not necessary. PHP has a built in development server that will work just fine and also run as the logged on user. 

DON'T RUN THIS ON THE PUBLIC INTERNET. THIS IS NOT INTENDED FOR THAT, NOR IS IT SECURE! 

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

    php5 -S 0.0.0.0:8000

8.) Point your browser to http://x.x.x.x:8000/  (x.x.x.x is the IP if your Raspberry Pi)

9.) The WebUI is pretty much self explanatory. Hit the aperture icon to take a picture. View the images on the Gallery page. The images are captured in whatever format the camera is set to use, and this does support RAW images as well. Images are stored on the Raspberry Pi's SD card, not in the camera's memory.

10.) The source images can be downloaded through the Web UI or can be FTP'd through an app like FileZilla over SFTP. The images are all stored in the "images" folder in relative to the root of the application. (i.e. ~/gphoto-webui-master/images) .
