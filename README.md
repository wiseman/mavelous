Mavelous
========

Mavelous is a browser-based ground control station (GCS) for
drones/UAVs/micro air vehicles.

Mavelous can be used with any vehicle that speaks the [MAVLink
protocol](http://qgroundcontrol.org/mavlink/start).  It has been
tested with the [Arducopter](http://code.google.com/p/arducopter/).

Here's a screenshot of Mavelous running in a desktop web browser:

![Screenshot of Mavelous running in a desktop
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-desktop-s.jpg
"Mavelous in a desktop browser")

Here's a video of Mavelous being used in the field to fly an
ArduCopter: http://www.youtube.com/watch?v=gEhxnVNXYeg


Architecture
------------

        *  Drone
        |
    *---+---*
        | 
        *
       
        ^
        | 
        | Radio link
        |
        V
       
    +--------+          +-----------------+
    |        |   HTTP   | Front end, runs |
    | Server |<-------->| in Browser      |
    |        |          |                 |
    +--------+          +-----------------+


Mavelous has two main parts:

1. Front end.  This is the HTML application that runs in a browser.

2. Server.  The server manages communication between the front end and
the drone.  It has a web server that talks to the front end, and it
sends and receives drone commands using a wireless modem (like an
[XBee radio](http://www.sparkfun.com/products/9099) or a [3D Robotics
radio](https://store.diydrones.com/3DR_Radio_USB_915_Mhz_Ground_module_p/br-3drusb915.htm)).

The front end and the server can run on the same computer, or on two
different computers.

The server is written in Python, and probably requires a laptop or
netbook.  The front end is written in HTML/CSS/Javascript, and can run
on anything with a web browser, including phones and tablets.


Why
---

Portability.  Controlling a drone with an iPad is kind of awesome, and
there are currently no ground control stations for amateur drones that
can run on an iPhone or iPad--Mavelous can (at least the front end
can).

The most popular Arducopter GCS, [APM Mission
Planner](http://code.google.com/p/ardupilot-mega/wiki/Mission), is
primarily a Windows application.  It can run under OS X and Linux with
Mono, but the experience is not always smooth.

The goal of Mavelous is to have a highly portable GCS that can talk to
anything that speaks the MAVLink protocol (and hopefully
[ROS](http://www.willowgarage.com/pages/software/ros-platform)
devices, too, some day).

![Screenshot of Mavelous running on an iPhone
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-iphone-s.jpg
"Mavelous in an iPhone browser")


How
---

Coming soon.  Need to add a feature to mavproxy.py first.


Feature status
--------------

Currently you can watch your drone fly around with Mavelous.  You can
see some basic flight data (speed, altitude, etc.).  You can double
click/tap on the map to send the drone to that location.

Features under development include

* Mission creation and editing
* A full-featured primary flight display


Mailing list
------------

There is a [mailing list](https://groups.google.com/group/mavelous)
for Mavelous users and developers.
