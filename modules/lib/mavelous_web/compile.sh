#!/bin/bash
set -o xtrace
set -o errexit
THIS_DIR=$(dirname "$0")

# Dependencies
DEPS_ROOT=${THIS_DIR}/.goog

CLOSURE_COMPILER_URL=http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSURE_COMPILER_DIR=${DEPS_ROOT}/compiler
CLOSURE_LIBRARY_DIR=${THIS_DIR}/third_party/closure-library
CLOSURE_COMPILER=${CLOSURE_COMPILER_DIR}/compiler.jar
CLOSURE_BUILDER=${CLOSURE_LIBRARY_DIR}/closure/bin/build/closurebuilder.py

function ensure_deps() {
    if [ ! -d "${DEPS_ROOT}" ]; then
        mkdir -p "${CLOSURE_COMPILER_DIR}"
        (
            cd "${CLOSURE_COMPILER_DIR}";
            curl -O "${CLOSURE_COMPILER_URL}";
            unzip compiler-latest.zip;
            rm compiler-latest.zip
        )
    fi
}

ensure_deps

rm -f ${THIS_DIR}/script/mavelous-compiled.js

python ${CLOSURE_BUILDER} \
    --root=${CLOSURE_LIBRARY_DIR}/closure/goog \
    --root=${CLOSURE_LIBRARY_DIR}/third_party/closure \
    --root=script/ \
    --namespace="Mavelous.App" \
    --output_mode=compiled \
    --compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS" \
    --compiler_flags="--summary_detail_level=3" \
    --compiler_flags="--warning_level=VERBOSE" \
    --compiler_flags="--externs=${THIS_DIR}/externs/backbone-0.9.1.js" \
    --compiler_flags="--externs=${THIS_DIR}/externs/jquery-1.7.js" \
    --compiler_flags="--externs=${THIS_DIR}/externs/kinetic-4.1.2.js" \
    --compiler_flags="--externs=${THIS_DIR}/externs/leaflet-0.5.js" \
    --compiler_flags="--externs=${THIS_DIR}/externs/underscore-1.3.1.js" \
    --compiler_jar=${CLOSURE_COMPILER} \
    > ${THIS_DIR}/script/mavelous-compiled.js
