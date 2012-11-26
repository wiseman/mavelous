Web demo
========

http://mavelousdemo.appspot.com/ is a demo of the mavelous user
interface, connected to a lo-fi simulation of a uav.

Hosting it on [Google
AppEngine](https://developers.google.com/appengine/) serves two goals:

1.  Free/cheap CDN
2.  Has some server-side logic to serve up the latest code from github.

The actual app running on AppEngine at
http://mavelousdemo.appspot.com/ is an instance of
[DryDrop](http://drydrop.binaryage.com), configured with the following
settings:

|Setting         |Value                                          |
|----------------|-----------------------------------------------|
|Pulling from    |https://github.com/wiseman/mavelous/raw/master |
|Config file is  |webdemo/site.yaml                              |

The app settings can be changed at
http://mavelousdemo.appspot.com/admin/settings.  jjwiseman@gmail.com
and pat@moreproductive.org have admin access.

The mavelous github repository has a custom post-receive webhook
pointing at http://mavelousdemo.appspot.com/hook/github that tells the
demo app when the code has changed.

The `site.yaml` file in this directory defines a URL mapping so that
http://mavelousdemo.appspot.com/ maps to `modules/lib/mavelous_web/`
in the repository.  Be careful--errors in `site.yaml` can break the
app until an admin goes to http://mavelousdemo.appspot.com/admin/cache
and flushes the resource cache.
