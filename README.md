Mavelous
========

Mavelous is an open source browser-based ground control station (GCS)
for drones/UAVs/micro air vehicles.

[Try the online demo](http://mavelousdemo.appspot.com/).

Mavelous can be used with any vehicle that speaks the [MAVLink
1.0 protocol](http://qgroundcontrol.org/mavlink/start).  It has been
tested with [Arducopter](http://code.google.com/p/arducopter/) and 
[ArduPlane](http://code.google.com/p/ardupilot-mega/).

Here's a screenshot of Mavelous running in a desktop web browser:

![Screenshot of Mavelous running in a desktop
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-desktop-s.jpg
"Mavelous in a desktop browser")

Mavelous running on an iPhone:

![Screenshot of Mavelous running on an iPhone
browser](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-iphone-s.jpg
"Mavelous in an iPhone browser")

Here's a video of Mavelous being used in the field with a tablet to fly
an ArduCopter:

![Mavelous Youtube Demo Video](https://github.com/wiseman/mavelous/raw/master/screenshots/mavelous-youtube.png "Mavelous YouTube Demo Video")

http://www.youtube.com/watch?v=QNql3n4C8iA


Installation
------------

Mavelous is written in Python, and it depends on
[mavlink](https://github.com/mavlink/mavlink) and
[CherryPy](http://www.cherrypy.org/)

First clone the mavelous and mavlink repositories:

```
$ cd src
$ git clone https://github.com/wiseman/mavlink  # Fork required to fix bugs
$ git clone git@github.com:wiseman/mavelous.git
```

Then install CherryPy.  The easiest way is with
[pip](http://www.pip-installer.org/en/latest/index.html):

```
$ pip install cherrypy
```

You will also need to install a python libarary that mavproxy depends on:

```
$ pip install pyserial
```

How to run it
-------------

### Online Demo

The [online demo](http://moreproductive.org/mavelous_web/) of Mavelous runs
completely within the browser. The simulated drone is very low fidelity
and simply follows a fixed path. It will not respond to navigation commands
such as guided mode.

You can also run the demo on your own machine by opening the html page in your
browser via the filesystem. The `index.html` file can be found at:

  ```
  mavelous/modules/lib/mavelous_web/index.html
  ```

### With a real drone

1. Connect your ArduCopter or ArduPlane to your computer with an Xbee or
   3DR Radio. Power on the vehicle.

2. Start mavproxy, specifying the serial port and data rate. On Linux,
   the serial port is probably named something like `/dev/ttyUSB0` or
   `/dev/ttyUSB1`.  For 3DR Radios, the data rate is usually 57600.
   For example:

    ```
    $ cd src/mavelous
    $ python mavproxy.py --master=/dev/ttyUSB0 --baud=57600
    ```

3. At the mavproxy prompt, load the mavelous module:

    ```
    STABILIZE> module load mavelous
    ```

A web browser will open showing you the Mavelous interface, or you can point a browser to http://localhost:9999.

You'll be able to use the Mavelous interface to control Guided mode once in
flight. Find out more about guided mode on [ArduCopter](http://code.google.com/p/arducopter/wiki/AC2_GuidedMode).

### Software in the loop simulation ArduCopter

1. Compile the ArduCopter firmware for Software in the loop similation (SITL).
   You'll need to use the ardupilot-mega project's Makefile build system:
   see details on the [ardupilot-mega wiki](http://code.google.com/p/ardupilot-mega/wiki/BuildingWithMake).

   ```
   $ make sitl
   ```
2. Run the ArduCopter executable in desktop mode.  For example:

    ```
    $ ~/ardupilot-mega/tmp/ArduCopter.build/ArduCopter.elf -H 20
    ```
   On some systems, this directory will be found at `/tmp/ArduCopter.build/`

2. Start the simulated multicopter.  For example:

    ```
    $ python ~/ardupilot-mega/Tools/autotest/pysim/sim_multicopter.py \
      --frame=+ --rate=400 --home=34.092047,-118.267136,20,0 --wind=6,45,.3
    ```

3. Start mavproxy:

    ```
    $ python mavproxy.py --master=tcp:127.0.0.1:5760 --out=127.0.0.1:14550 \
      --aircraft=test.ArduCopter --sitl=127.0.0.1:5501 --out=127.0.0.1:19550 \
      --quadcopter --streamrate=5
    ```

4. At the mavproxy prompt, load the mavelous module:

    ```
    GUIDED> module load mavelous
    ```

    A web browser will open showing you the Mavelous interface, or you can point a browser to http://localhost:9999.

5. Take off.  Soon, arducopter may support automated take-off.  Until then:

    ```
    GUIDED> switch 6   # Stabilize mode
    GUIDED> rc 3 1510  # Take-off throttle
    ``` 


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

    .............................................
    .  Mavelous                                 .
    .                                           .
    .  +--------+          +-----------------+  .
    .  |        |   HTTP   | Front end, runs |  .
    .  | Server |<-------->| in browser      |  .
    .  |        |          |                 |  .
    .  +--------+          +-----------------+  .
    .............................................

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
there are currently no open-source ground control stations that can
run on an iPhone or iPad--Mavelous can (at least the front end can).

The most popular ArduCopter GCS, [APM Mission
Planner](http://code.google.com/p/ardupilot-mega/wiki/Mission), is
primarily a Windows application.  It can run under OS X and Linux with
Mono, but the experience is not always smooth.

The goal of Mavelous is to have a highly portable GCS that can talk to
anything that speaks the MAVLink protocol (and hopefully
[ROS](http://www.willowgarage.com/pages/software/ros-platform)
devices, too, some day).


Feature status
--------------

Currently Mavelous is capable of monitoring and guiding a drone in flight.

* You can see basic flight data (speed, altitude, attitude) on the primary 
  flight display.
* You can double click/tap on the map to send the drone to that location.
* Multiple users can control the same drone.

We're working to add the following features soon:

* Control auto takeoff, loiter, and landing of an ArduCopter
* Mission creation and editing
* Offline support (map caching)

I'd like to add these features:

* Multi-vehicle control


Mailing list
------------

There is a public [mailing list](https://groups.google.com/group/mavelous)
for Mavelous users and developers.


Acknowledgments
------------

The Mavelous backend is based on [Mavproxy](https://github.com/tridge/MAVProxy),a command line ground station by Andrew Tridgell.

Mavelous uses open source code from the following projects: 
[Modestmaps.js](https://github.com/stamen/modestmaps-js/),
[Backbone.js](http://backbonejs.org/),
[Bootstrap](http://twitter.github.com/bootstrap/),
[jQuery](http://jquery.com/),
[Underscore.js](http://documentcloud.github.com/underscore/),
[Kinetic.js](http://www.kineticjs.com/),
and others.


License
-------

Mavelous is covered by the MIT license, see the accompanying file
LICENSE.md for details.

This repository contains additional code that may be covered by other
licenses, including jquery, MAVproxy and modest maps.
