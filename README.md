gphoto-webui
============

A PHP Web UI for gphoto2

So maybe this isn’t the coolest Raspberry Pi hack. But it was fun to make.

The reason I wrote this was simple: I wanted a way to snap photos while I was in front of the camera from my smartphone. I could have bought a fancy dongle and installed an app on my phone to get the same sort of behavior, but I already had a Raspberry Pi, and thought, "What if I could use that little mini computer to control my DSLR? It's small, portable, and I can hook it up to my DSLR via WiFi..." 

(The Mobile WiFi might be challenge... It could always "tether" your RasPi to your phone or tablet, or your could set up your RasPi as a WiFi AP too. My phone and tablet both support tethering, so I just use that.)

Turns out, I can thanks to a project called gphoto. gphoto is a CLI tool for doing things on many different models of cameras from all kinds of manufaturers, including Canon, which I have. All it needed was a way to control gphoto from my smartphone. I cloud use an SSH shell or a remote desktop, but where's the fun in that? I applied some PHP, HTML, and JavaScript magic to make it all happen so any device with a web browser can control the camera.

I’m using a RasPi model “B” (512 MB), but there’s no reason this wouldn’t work on model “A” or another box using Debian or Ubuntu Linux. I also have a WiFi adapter on my Raspber


1.) Power up your Raspberry Pi. Pull up a Terminal, logon through SSH, or whatever you do to get to a console.

2.) Update your Raspberry Pi

sudo apt-get update
sudo apt-get upgrade

3.) Install the following packages.

sudo apt-get install imagemagick php5 php5-cli php5-imagick gphoto2

Note: You do not need a web server. In fact, I wouldn’t recommend it for this little app because this app will need more elevated permissions tan the www-data user has. Configuring the server to run a user with elevated permissions might work, but not necessary. PHP has a built in development server that will work just fine and also run as the logged on user.

Note: As of writing this, gphoto2 package that comes with Raspian is a little outdated (version 2.4). I had some problems with my camera (a Canon 50D) and the packaged version, so I compiled it from the source. Here’s a cut-and-paste recipe for doing just that. I’d recommend running sudo –i before performing this guide to ensure no problems with permissions.

http://whysohardtoget.blogspot.com/2013/05/compiling-gphoto2-252-with-raspberry-pi.html

4.) Download the gphoto2 web ui from from github

5.) Extract the files into a directory

6.) In the console, cd to that directory

7.) Start the php server. This will bind the server to port 8000 on all IP’s.

php5 –S 0.0.0.0:8000

8.) Point your browser to http://x.x.x.x:8000/index.html  x.x.x.x is the IP if your Raspberry Pi.

9.) The WebUI is pretty much self explanatory. Having fun snapping pics!

The Mobile WiFi might be challenge... It could always "tether" your RasPi to your phone or tablet, or your could set up your RasPi as a WiFi AP too. My phone and tablet both support tethering, so I'll just use that. 

