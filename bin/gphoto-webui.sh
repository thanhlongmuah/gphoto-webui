#!/bin/sh

WEBUIDIR=~/gphoto-webui
PORT=8000

# functions
do_start () {
	cd $WEBUIDIR
	/usr/bin/php -S 0.0.0.0:$PORT >$WEBUIDIR/log/out.log 2>$WEBUIDIR/log/err.log &
	echo $! > $WEBUIDIR/log/pid
	echo PID:
	cat $WEBUIDIR/log/pid
}

do_stop() {
	cd $WEBUIDIR
	PID=`cat $WEBUIDIR/log/pid`
	kill $PID
	rm -f $WEBUIDIR/log/pid
}


case "$1" in
	start)
		do_start
		;;
	restart|reload)
		do_stop
		do_start
		;;
	stop)
		do_stop
		;;
	status)
		exit 0
		;;
	*)
		echo "Usage: $0 start|stop|restart" >&2
		exit 3
		;;
esac

