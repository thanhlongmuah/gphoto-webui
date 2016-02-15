<?php
//require_once("CameraRaw.php");
class gPhoto {

/////////////////////////////////////////////////////////////////////////////////
//
// VARIABLES
//

	private $quiet;
	private $keep;
	private $uilock;

//
//
/////////////////////////////////////////////////////////////////////////////////



//time gphoto2 --quiet --capture-image-and-download --filename "./images/capture-%Y%m%d-%H%M%S-%03n.%C"
//exec ("gphoto2 --set-config uilock=1",$output);
//echo join("\n",$output);
//exec ("gphoto2  --capture-image",$output);
//echo join("\n",$output);
//exec ("gphoto2 --set-config uilock=1",$output);
//echo join("\n",$output);

/*
$action = '';
if (isset($_GET['action'])){
	$action = $_GET['action'];
}
*/

/////////////////////////////////////////////////////////////////////////////////
//
// FUNCTIONS
//

//public function __constuct() {

//}


public function takePicture () {
	$returnObj = new stdClass();
	exec ("gphoto2 --capture-image-and-download --filename \"./images/capture-%Y%m%d-%H%M%S-%03n.%C\" 2>&1", $out, $rv);
	foreach ($out as $line) {
		$line = " " . $line;	// add a space at the beginning so strpos can search correctly
		if (strpos($line, 'Saving') !== false) {
			// string found
			$returnObj->filename = trim(explode("as", $line)[1]);
			$returnObj->message = "Photo successfully taken and stored: '" . $returnObj->filename . "'";
			$returnObj->returnStatus = true;
			break;
		}
	}

	if (strlen($returnObj->filename) == 0) {
		$returnObj->message = trim(implode("\n", $out));
		$returnObj->error = trim(implode("\n", $out));
		$returnObj->returnStatus = false;
	}

	return $returnObj;
}


public function getCamera () {
	$returnObj = new stdClass();
	exec ("gphoto2 --auto-detect", $output);
	//var_dump($output);	//debug
	$returnObj->camera = trim(explode("usb", $output[count($output) - 1])[0]);
	if (strpos(" " . $returnObj->camera, '-------------------------') !== false) {
		$returnObj->returnStatus = false;
		$returnObj->camera = "-- no camera detected --";
		$returnObj->error = "Camera not detected.";
	} else {
		$returnObj->returnStatus = true;
	}

	return $returnObj;
}


public function configList () {
	$returnObj = new stdClass();
	exec ("gphoto2 --list-config 2>&1", $output, $rv);
	$returnObj->config = $output;
	$returnObj->returnStatus = true;

	return $returnObj;
}


public function configGet ($config) {
	$returnObj = new stdClass ();
	$options = array ();
	$returnObj->returnStatus = false;	// set as default

	try {
		// sanitize "$config" input first
		// only accept letters and forward slashes (/)
		if (preg_match ("/^[\w\/]+$/", $config)) {	// Good
			exec ("gphoto2 --get-config " . trim($config), $output, $rv);
			$returnObj->config = $config;
			$parts = explode("/", $config);
			$returnObj->configName = $parts[count($parts)-1];
			foreach ($output as $line) {
				if (preg_match("/^Label: /", $line)) {
					$returnObj->label	= explode (' ', $line, 2)[1];
					$returnObj->returnStatus = true;
				} elseif (preg_match("/^Type: /", $line)) {
					$returnObj->type	= explode (' ', $line, 2)[1];
				} elseif (preg_match("/^Current: /", $line)) {
					$returnObj->current	= explode (' ', $line, 2)[1];
				} elseif (preg_match("/^Choice: /", $line)) {
					$option = explode (' ', $line, 3);
					array_push ($options, array("index" => $option[1], "value" => $option[2]));
				}
			}
			$returnObj->cameraSettings = $options;
		} else {
			$returnObj->error = "Invalid character in command";
		}
	} catch (Exception $e) {
		$returnObj->error   = $e->getMessage();
		$returnObj->message = $e->getMessage();
	}

	return $returnObj;
}


public function configSet ($config, $value) {
	// config variables
	


	$returnObj = new stdClass();
	exec ("gphoto2 --config-set 2>&1", $output, $rv);
	$returnObj->config = $output;
	$returnObj->returnStatus = true;

	return $returnObj;
}



public function getISO () {
	return $this->configGet("/main/imgsettings/iso");
}
public function getAperture () {
	return $this->configGet("/main/capturesettings/aperture");
}
public function getShutterSpeed () {
	return $this->configGet("/main/capturesettings/shutterspeed");
}



//
//
/////////////////////////////////////////////////////////////////////////////////

}	// end of Class



/////////////////////////////////////////////////////////////////////////////////
//
// MAIN SWITCH
//
//$gphoto = new gPhoto();


/*

try {
	switch($action){
		case "takePicture":
			gphoto->takePicture();
			break;

		case "getCamera":
			gphoto->getCamera();
			break;


//[-a|--abilities]
//[-L|--list-files]
//[--list-config]
//[--get-config=STRING]
//[--storage-info]


		case "configGet":
			$config = trim ($_GET['config']);
			if (isset ($config)) {
				configGet ($config);
			} else {
				configList ();
			}
			break;

		case "configSet":
			//configSet ();
			break;

		default:
			break;
	}
} catch (Exception $e) {
	//echo $e;
	var_dump($e);
}
*/

?>
