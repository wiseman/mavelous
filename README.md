Mavelous
========

Mavelous is a ground control station (GCS) for drones/UAVs/micro air
vehicles that runs in a web browser.

Any vehicle that speaks the [MAVLink
protocol](http://qgroundcontrol.org/mavlink/start) can be used with
Mavelous.  It has been tested with the
[Arducopter](http://code.google.com/p/arducopter/).

![Screenshot of Mavelous running in a desktop
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-desktop-s.jpg
"Mavelous in a desktop browser")
![Screenshot of Mavelous running on an iPhone
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-iphone-s.jpg
"Mavelous in an iPhone browser")


What
----

Mavelous has two main parts:

1. Front end.  This is the HTML application that runs in a browser.

2. Server.  The server manages communication between the front end and
the drone.  It has a web server that talks to the front end, and it
sends and receives drone commands using a wireless modem (like an
[XBee radio](http://www.sparkfun.com/products/9099) or a [3D Robotics
radio]https://store.diydrones.com/3DR_Radio_USB_915_Mhz_Ground_module_p/br-3drusb915.htm().

With a laptop or netbook, you can run both parts of Mavelous on the
same machine.  If you want to run the front end of Mavelous on a phone
or tablet, you will probably have to use another machine (laptop or
netbook) to run the server.


Why
---

Portability.  Controlling a drone with an iPad is kind of awesome, and
there are currently no ground control stations for amateur drones that
can run on an iPhone or iPad--Mavelous can (at least the front end
can).

The flagship DIY drone GCS, [APM Mission
Planner](http://code.google.com/p/ardupilot-mega/wiki/Mission), is
primarily a Windows application.  It can run under OS X and Linux with
Mono, but the experience is not always smooth.

The goal of Mavelous is to have a highly portable GCS that can talk to
anything that speaks the MAVLink protocol (and hopefully
[ROS](http://www.willowgarage.com/pages/software/ros-platform)
devices, too, some day).


How
---
