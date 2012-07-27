import BaseHTTPServer
import cgi
import json
import os
import os.path
import re
import threading
import types
import unicodedata
import urlparse

DOC_DIR = os.path.join(os.path.dirname(__file__), 'mmap_app')


class Server(BaseHTTPServer.HTTPServer):
  def __init__(self, handler, address='', port=9999, module_state=None):
    BaseHTTPServer.HTTPServer.__init__(self, (address, port), handler)
    self.allow_reuse_address = True
    self.module_state = module_state


# Taken from werkzeug, see
# https://github.com/mitsuhiko/werkzeug/blob/master/werkzeug/utils.py
# See
# http://lucumr.pocoo.org/2010/12/24/common-mistakes-as-web-developer/
# for why we do this.

_FILENAME_ASCII_STRIP_RE = re.compile(r'[^A-Za-z0-9_.-]')

_WINDOWS_DEVICE_FILES = (
  'CON', 'AUX', 'COM1', 'COM2', 'COM3', 'COM4', 'LPT1',
  'LPT2', 'LPT3', 'PRN', 'NUL')


def secure_filename(filename):
  """Pass it a filename and it will return a secure version of it.
  This filename can then safely be stored on a regular file system and
  passed to os.path.join.  The filename returned is an ASCII only
  string for maximum portability.

  On Windows system the function also makes sure that the file is not
  named after one of the special device files.

    >>> secure_filename("My cool movie.mov")
    'My_cool_movie.mov'
    >>> secure_filename("../../../etc/passwd")
    'etc_passwd'
    >>> secure_filename(u'i contain cool \xfcml\xe4uts.txt')
    'i_contain_cool_umlauts.txt'

  The function might return an empty filename.  It's your
  responsibility to ensure that the filename is unique and that you
  generate random filename if the function returned an empty one.
  """
  if isinstance(filename, unicode):
    filename = unicodedata.normalize('NFKD', filename).encode(
      'ascii', 'ignore')
  for sep in os.path.sep, os.path.altsep:
    if sep:
      filename = filename.replace(sep, ' ')
  filename = str(_FILENAME_ASCII_STRIP_RE.sub('', '_'.join(
    filename.split()))).strip('._')

  # On NT a couple of special files are present in each folder.  We
  # have to ensure that the target file is not such a filename.  In
  # this case we prepend an underline
  if (os.name == 'nt' and filename and
      filename.split('.')[0].upper() in _WINDOWS_DEVICE_FILES):
      filename = '_' + filename
  return filename


def content_type_for_file(path):
  content_types = {
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.mp3': 'audio/mpeg3'}
  root, ext = os.path.splitext(path)
  if ext in content_types:
    return content_types[ext]
  else:
    return 'text/plain; charset=utf-8'


def nul_terminate(s):
  nul_pos = s.find('\0')
  if nul_pos >= 0:
    return s[:nul_pos]
  else:
    return s


class Handler(BaseHTTPServer.BaseHTTPRequestHandler):
  # These are all under the mmap_app subdirectory.
  ALLOWABLE_STATIC_DIRS = [
    '.',
    'audio',
    'image',
    'script',
    'third_party',
    'third_party/bootstrap/js',
    'third_party/bootstrap/css',
    'third_party/bootstrap/img',
    ]

  def log_request(code, size=None):
    pass

  def do_POST(self):
    # Expects a JSON string in the body.
    content_len = int(self.headers.getheader('content-length'))
    post_body = self.rfile.read(content_len)
    command = json.loads(post_body)
    self.server.module_state.command(command)
    self.send_response(200)
    self.end_headers()

  def response_for_message(self, t, n, msg):
    mdict = msg.to_dict()
    for key, value in mdict.items():
      if isinstance(value, types.StringTypes):
        mdict[key] = nul_terminate(value)
    resp = {'time_usec': t,
            'index': n,
            'msg': mdict}
    return resp

  def do_GET(self):
    scheme, host, path, params, query, frag = urlparse.urlparse(self.path)
    query_dict = urlparse.parse_qs(query, keep_blank_values=True)
    ps = path.split('/')
    # API: /mavlink/mtype1+mtype2+...
    if len(ps) == 3 and ps[1] == 'mavlink':
      mtypes = ps[2].split('+')
      msgs = self.server.module_state.messages
      results = {}
      # Treat * as a wildcard.
      if mtypes == ['*']:
        mtypes = msgs.message_types()
      for mtype in mtypes:
        if msgs.has_message(mtype):
          (t, n, m) = msgs.get_message(mtype)
          results[mtype] = self.response_dict_for_message(m, t, n)
      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.end_headers()
      if 'pp' in query_dict or 'debug' in query_dict:
        self.wfile.write(json.dumps(results, indent=4))
      else:
        self.wfile.write(json.dumps(results))
    else:
      self.maybe_send_static_file(path)

  def maybe_send_static_file(self, path):
    directory_path, filename = os.path.split(path)
    # Remove leading '/'
    directory_path = directory_path[1:]
    if filename == '':
      filename = 'index.html'
    # A directory_path of '' means no subdirectories were asked for.
    if directory_path != '':
      # Some subdirectory has been specified, check that it's allowed.
      if not directory_path in self.ALLOWABLE_STATIC_DIRS:
        self.send_response(404)
        self.end_headers()
        # An invalid subdirectory was asked for.
        self.wfile.write('No such file.\n')
        return
    # The path must be OK!  Now just make sure the filename is OK.
    filename = secure_filename(filename)
    # Finally, we feel safe.  Construct the path and serve the file.
    path = os.path.join(directory_path, filename)
    content = None
    error = None
    try:
      with open(os.path.join(DOC_DIR, path), 'rb') as f:
        content = f.read()
    except IOError, e:
      error = str(e)
    if error:
      self.send_response(500)
      self.end_headers()
      self.wfile.write('Error: %s' % (cgi.escape(error),))
    else:
      self.send_response(200)
      self.send_header('Content-type', content_type_for_file(path))
      self.end_headers()
      self.wfile.write(content)

  def response_dict_for_message(self, msg, time, index):
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


def start_server(address, port, module_state):
  server = Server(
    Handler, address=address, port=port, module_state=module_state)
  server_thread = threading.Thread(target=server.serve_forever)
  server_thread.daemon = True
  server_thread.start()
  return server
