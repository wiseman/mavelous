Setup for a Linksys/Cisco WRT610N Version 1.0 
=============================================
with openWrt/dd-wrt firmwares


Requirements
------------
* Linksys/Cisco WRT610N Version 1.0

* USB Thumb Drive (any size larger then 64mb)

* USB Hub to support both 3dr radio and thumb drive

* About 30 minutes of time, and no fear of the a terminal/ssh client.



Setup Steps
-----------
1: Load openWrt/dd-wrt firmware onto device

2: Enable jffs (Needs a couple reboots to enable sometimes)

3: Enable SSHd

4: Mount USB Thumb drive to /opt

5: Install ipkg-opt (Optware) 

6: ipkg-opt install python2.7 (stock was 2.5, has issues)

7: Copy files from modules.zip to /opt/lib/python2.7

8: ipkg-opt install git

9: mkdir /opt/Mavelous; cd /opt/Mavelous; git clone mavlink and mavelous

10: (while still in /opt/Mavelous) python2.7 mavelous/mavproxy.py --master=/dev/usb/tts/0 --baud=57600 --module=mavelous



Additional Notes
----------------
* Turn down WIFI transmit powers, lowers chance of causing RC Link issues

* Place 3dr radio away from AP
