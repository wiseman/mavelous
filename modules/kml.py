import BaseHTTPServer
import os.path
import threading
import urlparse

import simplekml


class Server(BaseHTTPServer.HTTPServer):
  def __init__(self, handler, address='', port=9999, module_state=None):
    BaseHTTPServer.HTTPServer.__init__(self, (address, port), handler)
    self.allow_reuse_address = True
    self.module_state = module_state


def content_type_for_file(path):
  content_types = {
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8'}
  root, ext = os.path.splitext(path)
  if ext in content_types:
    return content_types[ext]
  else:
    return 'text/plain; charset=utf-8'


class Handler(BaseHTTPServer.BaseHTTPRequestHandler):
  def log_request(code, size=None):
    pass

  def do_GET(self):
      self.send_response(200)
      self.send_header('Content-type', 'application/vnd.google-earth.kml+xml')
      self.end_headers()
      self.wfile.write(self.server.module_state.kml())


def start_server(address, port, module_state):
  server = Server(
    Handler, address=address, port=port, module_state=module_state)
  server_thread = threading.Thread(target=server.serve_forever)
  server_thread.daemon = True
  server_thread.start()
  return server


g_module_context = None


class module_state(object):
  def __init__(self):
    self.server = None
    
  def kml(self):
      kml = simplekml.Kml()
      

def name():
  """return module name"""
  return 'mmap'


def description():
  """return module description"""
  return 'modest map display'


def init(module_context):
  """initialise module"""
  global g_module_context
  g_module_context = module_context
  state = module_state()
  g_module_context.mmap_state = state
  state.server = start_server(
    '0.0.0.0', port=9999, module_state=state)


def unload():
  """unload module"""
  global g_module_context
  g_module_context.mmap_state.server.terminate()


def mavlink_packet(m):
  """handle an incoming mavlink packet"""
  global g_module_context
  state = g_module_context.mmap_state
