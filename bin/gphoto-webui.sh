#!/bin/sh

WEBUIDIR=/home/pi/gphoto-webui
PORT=8000

# functions
do_start () {
	cd $WEBUIDIR
	/usr/bin/php5 -S 0.0.0.0:$PORT >./log/out.log 2>./log/err.log &
	echo $! > ./log/pid
	echo PID:
	cat ./log/pid
}

do_stop() {
	cd $WEBUIDIR
	PID=`cat $WEBUIDIR/log/pid`
	kill $PID
	rm -f ./log/pid
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

