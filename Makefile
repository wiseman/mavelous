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
	   fakemavlinkapi.js \
	   flightmode.js \
	   gpsstatus.js \
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
	   navbarbuttons.js \
	   pfd.js \
	   pfdsettings.js \
	   pfdview.js \
	   popoverbutton.js \
	   router.js \
	   settingsview.js \
	   statustextview.js \
	   vehicleleafletposition.js

JS_SRCS = $(addprefix ${JS_SCRIPT_DIR}/,${JS_FILES})

MAVELOUS_TARGET = ${JS_SCRIPT_DIR}/mavelous.min.js
MAVELOUS_DEPS_TARGET = ${JS_SCRIPT_DIR}/mavelous-deps.js


all: build deps

build: build-tool-deps ${MAVELOUS_TARGET}

deps: ${MAVELOUS_DEPS_TARGET}

lint:
	-gjslint --unix_mode --strict ${JS_SRCS}
	-jshint --config=jshintrc ${JS_SRCS}

lintfix:
	fixjsstyle --strict ${JS_SRCS}

clean:
	-rm ${MAVELOUS_TARGET} ${MAVELOUS_DEPS_TARGET}


build-tool-deps: ${CLOSURE_COMPILER}


${MAVELOUS_TARGET}: ${JS_SRCS}
	python ${CLOSURE_BUILDER} \
	    --root=${CLOSURE_LIBRARY_DIR}/closure/goog \
	    --root=${CLOSURE_LIBRARY_DIR}/third_party/closure \
	    --root=${WEB_DIR}/script/ \
	    --namespace="Mavelous.App" \
	    --output_mode=compiled \
	    --compiler_jar=${CLOSURE_COMPILER} \
	    --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	    --compiler_flags="--summary_detail_level=3" \
	    --compiler_flags="--warning_level=VERBOSE" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/jquery-1.7.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/backbone-0.9.1.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/kinetic-4.1.2.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/leaflet-0.5.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/twitter-bootstrap.js" \
	    --compiler_flags="--externs=${WEB_DIR}/externs/underscore-1.3.1.js" \
	    --compiler_flags="--generate_exports" \
	    --compiler_flags="--js_output_file=${MAVELOUS_TARGET}"


${MAVELOUS_DEPS_TARGET}: ${JS_SRCS}
	python ${CLOSURE_LIBRARY_DIR}/closure/bin/calcdeps.py \
	 --dep=${CLOSURE_LIBRARY_DIR} \
	 --path=${JS_SCRIPT_DIR} \
	 --exclude=${MAVELOUS_TARGET} \
	 --output_mode=deps \
	 --output_file=${MAVELOUS_DEPS_TARGET}


${CLOSURE_COMPILER}:
	mkdir -p ${CLOSURE_COMPILER_DIR}
	(cd ${CLOSURE_COMPILER_DIR}; \
	 curl -O "${CLOSURE_COMPILER_URL}"; \
	 unzip compiler-latest.zip; \
	 rm compiler-latest.zip);
