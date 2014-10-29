Setup for a Linksys/Cisco WRT610N Version 1.0 
=============================================
with openWrt/dd-wrt firmwares


Overview
--------
![Network Diagram](https://github.com/wiseman/mavelous/raw/master/screenshots/wrt/wrt-diagram.png)

Requirements
------------
* Linksys/Cisco WRT610N Version 1.0

* USB Thumb Drive (any size larger then 64mb)

* USB Hub to support both 3dr radio and thumb drive

* About 30 minutes of time, and no fear of the a terminal/ssh client.



Setup Steps
-----------
1: Load openWrt/dd-wrt firmware onto device (See http://dd-wrt.com/wiki/index.php/Linksys_WRT610N)

2: Enable jffs (Needs a couple reboots to enable sometimes).  This is found on the web admin of the router under Administration tab under the JFFS2 Support section.

	JFFS = Enable

3: Enable SSHd. This is found under Services tab, under the Secure Shell section.

	SSHd = Enable

4: Under Administration tab, and Commands sub tab, add the following

	insmod usbserial
	insmod ftdi_sio

and press the "Save Startup" to auto load the proper modules needed for 3dr radio usb.


5: Mount USB Thumb drive to /opt.  (See http://www.dd-wrt.com/wiki/index.php/USB_storage)

6: Install ipkg-opt (Optware) (See http://www.dd-wrt.com/wiki/index.php/Optware)

7: SSH to router and run the following command 

	ipkg-opt install python2.7

(stock was 2.5, has issues) this can also be ran via web gui via Administration tab and the Commands sub tab. Fill out the "Command Shell" box and press the Run Commands button.

8: Also run the command 

	ipkg-opt install git

9: Copy files from modules.zip to /opt/lib/python2.7 (Modules.zip includes all 3rd party needed python modules)

10: SSH to device and run the following: 

	mkdir /opt/Mavelous
	cd /opt/Mavelous
	git clone https://github.com/wiseman/mavlink
	git clone https://github.com/wiseman/mavelous

11: To start up, while still in /opt/Mavelous run

	python2.7 mavelous/mavproxy.py --master=/dev/usb/tts/0 --baud=57600 --module=mavelous


12: Need to work on auto startup that does not break the normal rc startup scripts :(


Control Scripts
---------------
Scripts are located in opt/Mavelous

MavClone.sh - Clone a copy of mavelous and mavlink from github.

MavUpdate.sh - Fetch updates for existing copy of mavelous and mavlink from github.

MavStart.sh - Starts up mavproxy.py, passing all arguments to mavproxy.py


Additional Notes
----------------
* Turn down WIFI transmit powers, lowers chance of causing RC Link issues

* Place 3dr radio away from AP

