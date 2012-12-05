Setting up a mavelous Wifi AP on a RPi running Arch Linux
=========================================================

The following instructions are based on this [Arch Linux RPi Image (2012-09-18)](http://downloads.raspberrypi.org/images/archlinuxarm/archlinux-hf-2012-09-18/archlinux-hf-2012-09-18.zip).

Prerequisites:

* Raspberry Pi Model B Revision 1.0 with [modifications](http://raspberrypi.stackexchange.com/questions/340/how-much-power-can-be-provided-through-usb) to allow for more power on the USB port (However, the USB dongle might also work without modifications) or Raspverry Pi Model B Revision 2.0
* [Wifi dongle](http://www.ebay.com/itm/150Mbps-WiFi-Wireless-N-WLAN-150N-USB2-0-Adapter-Stick-Dongle-XP-Vista-Win7-/270962133521)

Note:

     $ user command
     # root command

Preparing
---------

### First steps

It is assumed that the image has been [copied on to the SD card](http://elinux.org/RPi_Easy_SD_Card_Setup) and is connected over Ethernet to your network.

Find out the local IP of your RPi e.g. by looking it up in your Router administration page.

Connect using:

    $ ssh root@192.168.X.X

The standard password is root.

You can change it using

    # passwd

### Add a user

To add a normal user, do the following:

    # useradd -m -g users -G uucp -s /bin/bash pi # uucp is needed for FTDI devices

and set a password for the new user:

    # passwd pi

### Update the system

    # pacman -Syu

At this point, you might have to reboot and reconnect.

Install mavelous
----------------

    # pacman -S git-core python2 python2-flask python2-cherrypy python2-pyserial
    $ mkdir src
    $ cd src
    $ git clone http://github.com/mavlink/mavlink
    $ git clone http://github.com/wiseman/mavelous


Setting up the Access point
---------------------------

### Configure Network

Use the provided files `/etc/systemd/system/network.service` and `/etc/conf.d/network`:

    # cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/etc/systemd/system/network.service /etc/systemd/system/network.service

    # cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/etc/conf.d/network /etc/conf.d/network

    # systemctl enable network
    # systemctl start network


### Configure AP and DHCP Server

    # pacman -S dnsmasq hostapd

Use the provided files: `/etc/dnsmasq.conf` and `/etc/hostapd/hostapd.conf`:

    # mv -i /etc/dnsmasq.conf /etc/dnsmasq.conf.save
    # cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/etc/dnsmasq.conf /etc/dnsmasq.conf

    # mv -i /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.save
    # cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf

    # systemctl enable dnsmasq
    # systemctl start dnsmasq

    # systemctl enable hostapd
    # systemctl start hostapd

If all went well, there should be no errors/warnings

Running mavelous manually
-------------------------

To manually start mavelous, use:

    $ cd /home/pi/src/mavelous/
    $ python2 mavproxy.py --master=/dev/ttyAMA0 --baud=57600 --module=mavelous

Running mavelous automatically
------------------------------

To boot straight into mavelous, make the user login automatically:

Copy the file `/etc/systemd/system/autologin@.service`:

    # cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/etc/systemd/system/autologin@.service /etc/systemd/system/autologin@.service

and execute:

    # systemctl daemon-reload
    # systemctl disable getty@tty1
    # systemctl enable autologin@tty1
    # systemctl start autologin@tty1


Also, add the following to the file `/home/USERNAME/.bashrc` to start mavelous 

    cd /home/pi/src/mavelous/
    python2 mavproxy.py --master=/dev/ttyAMA0 --baud=57600 --module=mavelous

or copy the file like this;

    $ mv -i /home/pi/.bashrc /home/pi/.bashrc.save
    $ cp -i /home/pi/src/mavelous/devices/raspberry_pi/arch_linux/home/pi/.bashrc /home/pi/.bashrc

