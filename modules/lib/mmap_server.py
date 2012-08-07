import cgi
import json
import logging
import os
import os.path
import re
import threading
import types
import unicodedata
import urlparse

from cherrypy import wsgiserver
import flask
from werkzeug import SharedDataMiddleware

app = flask.Flask(__name__)
#app.debug = True
#app.logger.setLevel(logging.DEBUG)

DOC_DIR = os.path.join(os.path.dirname(__file__), 'mmap_app')

app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
    '/': DOC_DIR
    })


@app.route('/mavlink/<msgtypes>')
def mavlink(msgtypes):
  mtypes = msgtypes.split('+')
  msgs = app.module_state.messages
  results = {}
  # Treat * as a wildcard.
  if mtypes == ['*']:
    mtypes = msgs.message_types()
  for mtype in mtypes:
    if msgs.has_message(mtype):
      (t, n, m) = msgs.get_message(mtype)
      results[mtype] = response_dict_for_message(m, t, n)
  return flask.jsonify(results)


def nul_terminate(s):
  nul_pos = s.find('\0')
  if nul_pos >= 0:
    return s[:nul_pos]
  else:
    return s


def response_for_message(self, t, n, msg):
  mdict = msg.to_dict()
  for key, value in mdict.items():
    if isinstance(value, types.StringTypes):
      mdict[key] = nul_terminate(value)
  resp = {'time_usec': t,
          'index': n,
          'msg': mdict}
  return resp




#   def do_POST(self):
#     scheme, host, path, params, query, frag = urlparse.urlparse(self.path)
#     # Expects a JSON string in the body.
#     content_len = int(self.headers.getheader('content-length'))
#     post_body = self.rfile.read(content_len)
#     body_obj = json.loads(post_body)
#     if self.path.find('jslog') >= 0:
#       # Logging from client side.
#       logging.info('jslog: %s' % (body_obj,))
#     else:
#       # Otherwise assume it's a command.
#       self.server.module_state.command(body_obj)
#     self.send_response(200)
#     self.end_headers()

#   def do_GET(self):
#     scheme, host, path, params, query, frag = urlparse.urlparse(self.path)
#     query_dict = urlparse.parse_qs(query, keep_blank_values=True)
#     ps = path.split('/')
#     # API: /mavlink/mtype1+mtype2+...
#     if len(ps) == 3 and ps[1] == 'mavlink':
#       mtypes = ps[2].split('+')
#       msgs = self.server.module_state.messages
#       results = {}
#       # Treat * as a wildcard.
#       if mtypes == ['*']:
#         mtypes = msgs.message_types()
#       for mtype in mtypes:
#         if msgs.has_message(mtype):
#           (t, n, m) = msgs.get_message(mtype)
#           results[mtype] = self.response_dict_for_message(m, t, n)
#       self.send_response(200)
#       self.send_header('Content-type', 'application/json')
#       self.end_headers()
#       if 'pp' in query_dict or 'debug' in query_dict:
#         self.wfile.write(json.dumps(results, indent=4))
#       else:
#         self.wfile.write(json.dumps(results))
#     else:
#       self.maybe_send_static_file(path)

#   def maybe_send_static_file(self, path):
#     directory_path, filename = os.path.split(path)
#     # Remove leading '/'
#     directory_path = directory_path[1:]
#     if filename == '':
#       filename = 'index.html'
#     # A directory_path of '' means no subdirectories were asked for.
#     if directory_path != '':
#       # Some subdirectory has been specified, check that it's allowed.
#       if not directory_path in self.ALLOWABLE_STATIC_DIRS:
#         self.send_response(404)
#         self.end_headers()
#         # An invalid subdirectory was asked for.
#         self.wfile.write('No such file.\n')
#         return
#     # The path must be OK!  Now just make sure the filename is OK.
#     filename = secure_filename(filename)
#     # Finally, we feel safe.  Construct the path and serve the file.
#     path = os.path.join(directory_path, filename)
#     content = None
#     error = None
#     try:
#       with open(os.path.join(DOC_DIR, path), 'rb') as f:
#         content = f.read()
#     except IOError, e:
#       error = str(e)
#     if error:
#       self.send_response(500)
#       self.end_headers()
#       self.wfile.write('Error: %s' % (cgi.escape(error),))
#     else:
#       self.send_response(200)
#       self.send_header('Content-type', content_type_for_file(path))
#       self.end_headers()
#       self.wfile.write(content)


def response_dict_for_message(msg, time, index):
  mdict = msg.to_dict()
  for key, value in mdict.items():
    if isinstance(value, types.StringTypes):
      mdict[key] = nul_terminate(value)
    resp = {
      'time_usec': time,
      'index': index,
      'msg': mdict
      }
  return resp


#def start_server(address, port, module_state):
#  server = Server(
#    Handler, address=address, port=port, module_state=module_state)
#  server_thread = threading.Thread(target=server.serve_forever)
#  server_thread.daemon = True
#  server_thread.start()
#  return server

def start_server(address, port, module_state):
  dispatcher = wsgiserver.WSGIPathInfoDispatcher({'/': app})
  server = wsgiserver.CherryPyWSGIServer(
    ('0.0.0.0', 9999),
    dispatcher)
  server_thread = threading.Thread(target=server.start)
  server_thread.daemon = True
  server_thread.start()
  app.module_state = module_state
  return server
