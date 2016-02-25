<?php
require_once("CameraRaw.php");
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
/*
	// capture the image and download it to the Pi right away
	exec ("gphoto2 --capture-image-and-download --filename \"./images/capture-%Y%m%d-%H%M%S-%03n.%C\" 2>&1", $out, $rv);
	foreach ($output as $line) {
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
*/

	$returnObj = new stdClass();
	$returnObj->success = false;
	$imgDir = "./images/";

	// may need to set the capture target to SDCard first
	// gphoto2 --set-config=/main/settings/capturetarget=1
	//
	//$setCaptureTarget = "gphoto2 --set-config=/main/settings/capturetarget=1; ";
	//exec ($setCaptureTarget . " gphoto2 --capture-image 2>&1", $output, $rv);
	//exec ("gphoto2 --capture-image-and-download --keep --filename \"./images/capture-%Y%m%d-%H%M%S-%03n.%C\" 2>&1", $output, $rv);

	$rv = chdir ($imgdir);
	// confirm we are in the correct directory
	if ( ! $rv) {
		$returnObj->error = "Could not change to the 'images' directory";
		return $returnObj;
	}
	exec ("gphoto2 --capture-image-and-download --keep 2>&1", $output, $rv);
	$returnObj->commandOutput = $output;

	// Saving file as IMG_9342.CR2
	$line = $output[1];
	if (preg_match("/^Saving file as /", $line)) {
		$cameraFile = explode(' ', $line)[3];
		//$filearr  = explode('/', $filepath[3]);
		//$cameraFile = $filearr[ count($filearr) - 1 ];	// get file name
		$returnObj->file = $cameraFile;

		//$returnObj->message = $output[0];
		$returnObj->message = "Photo taken: " . $cameraFile;
		$returnObj->success = true;

		// generate JPG preview image
		$raw = new CameraRaw();
		if (file_exists ($cameraFile)) {
			if ($raw->isRawFile($cameraFile)) {
				// raw, so let's convert
				$cameraFileFull = realpath ($cameraFile);
				$fileJPG        = $cameraFile . ".jpg";
				$fileJPGFull    = realpath ($cameraFileFull) . ".jpg";
				$raw->generateImage($cameraFileFull, $fileJPGFull, 1024, 768);
			} else {
				// already a jpg
				$fileJPG = $cameraFile;
			}
			$returnObj->fileJPG = $fileJPG;
		}

	}
	else {
		$returnObj->error = "Could not capture image. Check camera settings or focus: " . $output[0];
	}

	// change back to the home directory
	chdir ($_SERVER['DOCUMENT_ROOT']);

	return $returnObj;
}


public function getCamera () {
	$returnObj = new stdClass();
	exec ("gphoto2 --auto-detect", $output);
	//var_dump($output);	//debug
	$returnObj->camera = trim(explode("usb", $output[count($output) - 1])[0]);
	if (strpos(" " . $returnObj->camera, '-------------------------') !== false) {
		$returnObj->success = false;
		$returnObj->camera = "-- no camera detected --";
		$returnObj->error = "Camera not detected.";
	} else {
		$returnObj->success = true;
	}

	return $returnObj;
}


public function configList () {
	$returnObj = new stdClass();
	exec ("gphoto2 --list-config 2>&1", $output, $rv);
	$returnObj->config = $output;
	$returnObj->success = true;

	return $returnObj;
}


public function configGet ($config) {
	$returnObj = new stdClass ();
	$options = array ();
	$returnObj->success = false;	// set as default

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
					$returnObj->success = true;
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
	$returnObj = new stdClass();
	$returnObj->success = false;
	// verify variables
	if (preg_match ("/^[\w\/]+$/", $config) && is_numeric($value)) {	// Good
		exec ("gphoto2 --set-config=" . $config . "=" . $value . " 2>&1", $output, $rv);
		$returnObj->commandOutput = $output;
		if ($rv == 0) {
			$returnObj->message = "Success";
			$returnObj->success = true;
		} else {
			$returnObj->error = "Could not set value: " . $output[0];
		}
	} else {
		$returnObj->error = "Invalid character in command";
	}

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


public function getCameraFiles ($pageNum, $countOnPage) {
	$returnObj->success = false;

	// first, confirm variables are numbers
	if ( ! is_numeric($pageNum) && ! is_numeric($countOnPage) && $pageNum > 1000 && $countOnPage > 1000000 && $pageNum < 1 && $countOnPage < 5) {
		$returnObj->error = "Error: Not a valid number.";
		return $returnObj;
	}

	// gphoto2 --skip-existing --get-thumbnail x-y 2>&1
	// Downloading 'MVI_8748.MOV' from folder '/store_00010001/DCIM/100EOS7D'...
	// Saving file as thumb_MVI_8748.MOV
	// Downloading 'MVI_9321.MOV' from folder '/store_00010001/DCIM/100EOS7D'...
	// Skip existing file thumb_MVI_9321.MOV
	// *** Error ***
	// Bad file number. You specified 685, but there are only 684 files available in '/' or its subfolders. Please obtain a valid file number from a file listing first.
	// *** Error (-2: 'Bad parameters') ***

	$files = $this->getListOfFiles();

	$startAt = (($pageNum - 1) * $countOnPage) + 1;		// to avoid skipping the first page, we have to play with the numbers a bit
	$endAt   = $startAt + $countOnPage;
	// get thumbnails for just the ones we need
	exec ("gphoto2 --skip-existing --get-thumbnail " . $startAt . "-" . $endAt . " 2>&1", $output, $rv);

	$returnObj->filenames = array ();
	//foreach ($output as $line) {
	for ($i = 0, $num = 0; $i < count($output); $i++) {
		$line = $output[$i];
		//$line = preg_replace('!\s+!', ' ', $line);      // replace multiple spaces with just one
		$arr = array ();
		$imageFound = false;
		$fn = "";

		if (preg_match ("/^Saving file as /", $line)) {			// new thumb file
			$imageFound = true;
			// rename file to jpg/jpeg
			$name = explode (" ", $line)[3];
			$fn = $name . ".jpg";
			rename ($name, $fn);
		}
		elseif (preg_match ("/^Skip existing file /", $line)) {		// thumb file already exists, likely a JPG already
			$imageFound = true;
			$fn = explode (" ", $line)[3];
			$arr["name"] = $fn;
		}


		// get resolution for current image
		if ( $imageFound) {

			// set success flag
			$returnObj->success = true;

			$arr["num"]  = $startAt + $num;
			$arr["name"] = $fn;

			// get resolution
			if (file_exists ($fn)) {
/*				$resource = new Imagick($fn);
				$imageResolution = $resource->getImageResolution();
				$arr["w"] = $imageResolution['y'];
				$arr["h"] = $imageResolution['x'];
*/
				$arr['w'] = 0;
				$arr['h'] = 0;
			} else {
				$arr['w'] = 0;
				$arr['h'] = 0;
			}
			array_push($returnObj->filenames, $arr);
			$num++;
		}
	}

	// DEBUG
	$returnObj->message = $output;

	return $returnObj;
}


public function getListOfFiles () {
	// get list of files
	exec ("gphoto2 --list-files 2>&1", $output, $rv);
	if (preg_match('/Error/', $output[0])) {        // check for Error
		$returnObj->error = trim(str_replace('*', '', $output[0]));
	} else {        // No Error
		$returnObj->files = array ();
		$currentdir = "";

		foreach ($output as $line) {
			$line = preg_replace('!\s+!', ' ', $line);      // replace multiple spaces with just one

			if (preg_match("/^There are \d+ files in folder/", $line)) {
				$arr = explode("'", $line);
				$currentdir = $arr[1] . "/"; // directory path
				//$filecount = explode(" ", $arr[0])[2];       // number of files in the directory
			}
			// Example:
			// '#10    IMG_8017.CR2               rd 21601 KB image/x-canon-cr2'
			elseif (preg_match("/^#\d+ \w+\.\w+ /", $line)) {
				//$filecount = intval($filecount);
				$arr = explode(" ", $line);
				$obj = new stdClass();
				$obj->dir               = $currentdir;
				$obj->num               = $arr[0];
				$obj->filename          = $arr[1];
				$obj->permissions       = $arr[2];
				$obj->filesize          = $arr[3];
				$obj->filesizeunit      = $arr[4];
				$obj->filetype          = $arr[5];
				array_push($returnObj->files, $obj);
			}
		}
	}

	return $returnObj;
}


public function getFile ($fileID) {

	$returnObj->success = false;

	// verify id
	if (is_numeric ($fileID) ) {
		// change directory to tmp first
		$rv = chdir ("./tmp/");
		// confirm we are in the correct directory
		if ( ! $rv) {
			$returnObj->error = "Could not change to the tmp directory";
			return $returnObj;
		}
		// get-file
		$cmd = "gphoto2 --skip-existing --get-file=" . $fileID . " >$$.txt; cat $$.txt; rm -f $$.txt";
		exec ($cmd, $output, $rv);
		// output sample: "Saving file as IMG_8617.CR2"
		$line = implode ("", $output);
		$returnObj->output = $output;
		// verify file was saved
		if (preg_match("/^Saving file as /", $line) || preg_match("/^Skip existing file /", $line) ) {
			// success
			// parse filename
			$fn = explode(" ", $line)[3];
			if (file_exists($fn)) {
				// initiate file download
/*				header("Content-Type: application/octet-stream");
				header("Content-Disposition: attachment; filename=" . $_GET['fn']);
				readfile($_GET['fn']);
*/
				$returnObj->filename = $fn;
				$returnObj->success  = true;
			}
			else {
				// failed
				$returnObj->error = "File does not exist: " . $fn;
			}
		} else {
			// failed
			$returnObj->error = "Could not save file: " . $line;
		}
	}
	else {
		$returnObj->error = "Not a number: '" . $fileID . "'";
	}
	// change back to the home directory
	chdir ($_SERVER['DOCUMENT_ROOT']);
	return $returnObj;
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
