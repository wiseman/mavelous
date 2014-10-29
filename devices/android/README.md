Setup for an Android device running mavelous host (and client)
==============================================================

Requirements
------------
Android Device (Root currently needed)

[Py4A](http://code.google.com/p/python-for-android/) Python for Android

Setup Steps
-----------
1: Root Android device and get a terminal loaded (or use ADB console)

2: Load Py4A (Or Sl4a with python interpreter)

3: Copy modules.zip to /insert/wacky/python/path/here

4: Create standalone python script (or download) (This enabled "python" command, and sets proper environment up for python to run).

5: Copy mavelous and mavproxy to /sdcard/Mavelous/

6: CD /sdcard/Mavelous

7: Run
	python mavelous/mavproxy.py --master=ip.address.of.router:port --module=mavelous

8: Open Browser on Android and browse to http://127.0.0.1:9999









