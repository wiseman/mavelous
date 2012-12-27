#!/bin/sh
THIS_DIR=$(dirname "$0")
CLOSURE_LIBRARY_DIR=${THIS_DIR}/third_party/closure-library
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --dep $CLOSURE_LIBRARY_DIR \
  --path ${THIS_DIR}/script \
  --output_mode deps > ${THIS_DIR}/script/mavelous-deps.js

#python ${CLOSURE_LIBRARY_DIR}/closure/bin/build/closurebuilder.py \
#  --root=${THIS_DIR}/script \
#  --root=${THIS_DIR}/third_party/closure-library/closure \
#  --namespace=mavelous.app \
#  --output_mode=list \
#  --output_file=mavelous.js

