WEB_DIR = modules/lib/mavelous_web
JS_SCRIPT_DIR = ${WEB_DIR}/script
TOOL_DEPS_ROOT = .tools

CLOSURE_COMPILER_URL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSURE_COMPILER_DIR = ${TOOL_DEPS_ROOT}/compiler
CLOSURE_COMPILER = ${CLOSURE_COMPILER_DIR}/compiler.jar

VIRTUALENV_DIR = ${TOOL_DEPS_ROOT}/env

CLOSURE_LIBRARY_DIR = ${WEB_DIR}/third_party/closure-library
CLOSURE_BUILDER = ${CLOSURE_LIBRARY_DIR}/closure/bin/build/closurebuilder.py

JS_FILES = app.js \
	   batterystatus.js \
	   commstatus.js \
	   commstatuspopover.js \
	   fakemavlinkapi.js \
	   flightmode.js \
	   flightmodepopover.js \
	   gpsstatus.js \
	   gpsstatuspopover.js \
	   guidemodel.js \
	   guideview.js \
	   leaflet_app.js \
	   leafletdroneicon.js \
	   leafletpanmodel.js \
	   leafletproviders.js \
	   leafletview.js \
	   mavlinkapi.js \
	   mavutil.js \
	   mission.js \
	   missionui.js \
	   modestringview.js \
	   pfd.js \
	   pfdsettings.js \
	   pfdview.js \
	   popoverview.js \
	   radiopopovers.js \
	   router.js \
	   settingsview.js \
	   statustextview.js \
	   vehicleleafletposition.js

JS_SRCS = $(addprefix ${JS_SCRIPT_DIR}/,${JS_FILES})

MAVELOUS_TARGETS = ${JS_SCRIPT_DIR}/mavelous.min.js ${JS_SCRIPT_DIR}/mavelous-deps.js ${WEB_DIR}/index.html ${WEB_DIR}/index_compiled.html

.PHONY: all build deps lint lintfix clean build-tool-deps


all: build deps

build: build-tool-deps ${MAVELOUS_TARGETS}

deps: ${JS_SCRIPT_DIR}/mavelous-deps.js

lint:
	-gjslint --unix_mode --strict ${JS_SRCS}
	-jshint --config=jshintrc ${JS_SRCS}

lintfix:
	fixjsstyle --strict ${JS_SRCS}

clean:
	-rm ${MAVELOUS_TARGETS}


build-tool-deps: ${CLOSURE_COMPILER}


${JS_SCRIPT_DIR}/mavelous.min.js: ${JS_SRCS} ${WEB_DIR}/externs/*.js
	python ${CLOSURE_BUILDER} \
	    --root=${CLOSURE_LIBRARY_DIR}/closure/goog \
	    --root=${CLOSURE_LIBRARY_DIR}/third_party/closure \
	    --root=${WEB_DIR}/script/ \
	    --namespace="Mavelous.App" \
	    --output_mode=compiled \
	    --compiler_jar=${CLOSURE_COMPILER} \
	    --compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS" \
	    --compiler_flags="--summary_detail_level=3" \
	    --compiler_flags="--warning_level=VERBOSE" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/jquery-1.7.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/backbone-0.9.1.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/kinetic-4.1.2.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/leaflet-0.5.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/twitter-bootstrap.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/underscore-1.3.1.js" \
	    --compiler_flags="--generate_exports" \
	    --compiler_flags="--js_output_file=$@"


${JS_SCRIPT_DIR}/mavelous-deps.js: ${JS_SRCS}
	python ${CLOSURE_LIBRARY_DIR}/closure/bin/calcdeps.py \
	 --dep=${CLOSURE_LIBRARY_DIR} \
	 --path=${JS_SCRIPT_DIR} \
	 --exclude=${JS_SCRIPT_DIR}/mavelous.min.js \
	 --output_mode=deps \
	| sort > $@


${WEB_DIR}/index.html: ${WEB_DIR}/index.tmpl
	python jinja_static.py ${WEB_DIR}/index.tmpl --output_file=${WEB_DIR}/index.html

${WEB_DIR}/index_compiled.html: ${WEB_DIR}/index.tmpl
	python jinja_static.py ${WEB_DIR}/index.tmpl -D compiled --output_file=${WEB_DIR}/index_compiled.html



${CLOSURE_COMPILER}:
	mkdir -p ${CLOSURE_COMPILER_DIR}
	(cd ${CLOSURE_COMPILER_DIR}; \
	 curl -O "${CLOSURE_COMPILER_URL}"; \
	 unzip compiler-latest.zip; \
	 rm compiler-latest.zip);
