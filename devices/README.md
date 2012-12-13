
Device Setup Files
==================

Setup files for getting mavelous running on various types of devices

[Rasberry Pi Model B Rev1](https://github.com/wiseman/mavelous/tree/master/devices/raspberry_pi)
------------------------
Run the Mavelous code on the [Rasberry Pi](http://www.raspberrypi.org), as well as have it function as an Access Point for wireless clients. Can redirect telemetry feeds to other IP addresses on the same network for other ground stations such as [QGroundControl](http://qgroundcontrol.org) and [ArduPilot Mission Planner](http://code.google.com/p/ardupilot-mega/wiki/MissionPlanner).

[openWrt](https://github.com/wiseman/mavelous/tree/master/devices/openWrt) / [Linksys WRT610N Rev 1.0](https://github.com/wiseman/mavelous/tree/master/devices/openWrt/linksys-wrt610nv1)
---------------------------------
Run the Mavelous code on the router and allow for wifi clients (Tablets, phones, laptops, etc). The WRT610 acts as the base station for receiving the telemetry feed. It can send out this feed to other ground stations such as [QGroundControl](http://qgroundcontrol.org) and [ArduPilot Mission Planner](http://code.google.com/p/ardupilot-mega/wiki/MissionPlanner).

[android / Xoom Wifi Tablet](https://github.com/wiseman/mavelous/tree/master/devices/android)
--------------------------
Run the Mavelous code on the tablet, as well as the web UI. No need for separate devices. This project is currently on hold due to driver issues. Should work in conjunction with the open-wrt based setup using network sockets to communicate, instead of USB-OTG Cable.

MavelousOS linux appliance
--------------------------
SuseStudio appliance for running mavelous in a VM, LiveCD, or USB ThumbDrive setting. Has scripts to update the mavelous code from github. [Click here to Download](http://susestudio.com/a/FS6gnm/mavelousos)