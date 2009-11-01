#!/bin/bash
OUT='meteo-icm-gadget.xml'

cat head.xml > $OUT
if [ "$1" == "-d" ]; then
    cat src.js >> $OUT
else
    grep -v '<!\-\-.*\-\->' src.js | \
        grep -v 'script.*logging.js' | \
        grep -v 'Logger\.getLogger' | \
        grep -v 'logging_div' | \
        grep -v '\blog\.' | \
        ./jsmin.exe >> $OUT
fi
cat foot.xml >> $OUT
