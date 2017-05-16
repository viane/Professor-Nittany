#!/bin/sh

#usage: ./print\ filename.sh >> output.txt

for i in *.docx; do echo "${i%.docx}"; done
