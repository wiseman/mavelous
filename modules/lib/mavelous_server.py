import json
import os
import os.path
import threading
import types

from cherrypy import wsgiserver
import flask
from werkzeug import wsgi

app = flask.Flask(__name__)

DOC_DIR = os.path.join(os.path.dirname(__file__), 'mavelous_web')

app.wsgi_app = wsgi.SharedDataMiddleware(
  app.wsgi_app,
  {'/': DOC_DIR})


@app.route('/')
def index_view():
  return flask.redirect('/index.html')


@app.route('/mavlink/<msgtypes>')
def mavlink_view(msgtypes):
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


@app.route('/guide', methods=['POST'])
def guide_handler():
  # FIXME: I couldn't figure out how to get jquery to send a
  # Content-Type: application/json, which would have let us use
  # request.json.  And for some reason the data is in the key name.
  body_obj = json.loads(flask.request.form.keys()[0])
  app.module_state.guide(body_obj)
  return 'OK'


@app.route('/command_long', methods=['POST'])
def command_long_handler():
  # FIXME: I couldn't figure out how to get jquery to send a
  # Content-Type: application/json, which would have let us use
  # request.json.  And for some reason the data is in the key name.
  body_obj = json.loads(flask.request.form.keys()[0])
  app.module_state.command_long(body_obj)
  return 'OK'


@app.route('/rcoverride', methods=['POST'])
def rcoverride_handler():
  body_obj = json.loads(flask.request.form.keys()[0])
  app.module_state.rcoverride(body_obj)
  return 'OK'


@app.route('/get_mission', methods=['POST'])
def get_mission_handler():
  app.module_state.get_mission()
  return 'OK'


def nul_terminate(s):
  nul_pos = s.find('\0')
  if nul_pos >= 0:
    return s[:nul_pos]
  else:
    return s


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


def start_server(address, port, module_state):
  dispatcher = wsgiserver.WSGIPathInfoDispatcher({'/': app})
  server = wsgiserver.CherryPyWSGIServer(
    (address, port),
    dispatcher)
  server_thread = threading.Thread(target=server.start)
  server_thread.daemon = True
  server_thread.start()
  app.module_state = module_state
  return server
