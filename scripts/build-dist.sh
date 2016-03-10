#!/bin/sh

WEBUIDIR=~/gphoto-webui/
TMPDIR=./gphoto-webui/
ZIPNAME=gphoto-webui.zip

rm -rf $TMPDIR
mkdir $TMPDIR

cp -rf $WEBUIDIR/*.php $WEBUIDIR/*.html $WEBUIDIR/js $WEBUIDIR/css $TMPDIR
cp -rf $WEBUIDIR/bin $WEBUIDIR/img $WEBUIDIR/fonts $TMPDIR

zip -r $ZIPNAME $TMPDIR

rm -rf $TMPDIR
mv -f $ZIPNAME ../dist/.
