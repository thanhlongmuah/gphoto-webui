<?php
require_once("CameraRaw.php");
require_once("gPhoto.php");

// make sure we're in the correct directory
chdir ($_SERVER['DOCUMENT_ROOT']);

////////////////////////////////////////////////////////////////////////////
// Variables
//
$returnObj = new stdClass();	// set the object to avoid the php warning
$thumbsDir = "thumbs/";		// thumbnail directory
$gphoto = new gPhoto();


//time gphoto2 --quiet --capture-image-and-download --filename "./images/capture-%Y%m%d-%H%M%S-%03n.%C"
//exec ("gphoto2 --set-config uilock=1",$output);
//echo join("\n",$output);
//exec ("gphoto2  --capture-image",$output);
//echo join("\n",$output);
//exec ("gphoto2 --set-config uilock=1",$output);
//echo join("\n",$output);

$action = '';
if (isset($_GET['action'])){
	$action = $_GET['action'];
}




try {
	switch($action){
		case "clearTempFiles":
			// clear tmp directory
			$dir = "tmp/";
			$returnObj->success = false;
			if (chdir($dir)) {
				// clear files
				array_map("unlink", glob('some/dir/*.txt'));	/**/
				$returnObj->success = true;
			}
			else {
				$returnObj->error = "Could not change directory: " . $dir;
			}
			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;
		case "takePicture":
			$returnObj = $gphoto->takePicture();
			//header('Content-Type: application/json');
			//echo json_encode($returnObj);
			header('Content-Type: text/plain');
			echo $returnObj;
			break;

			// take picture and copy it to the RPi
			exec ("gphoto2 --capture-image-and-download --filename \"./images/capture-%Y%m%d-%H%M%S-%03n.%C\" 2>&1", $output, $rv);
			// instead of taking the picture and downloading it, let's just get the thumbnail
			//exec ("gphoto2 --capture-image", output, $rv);
			foreach ($output as $line) {
				$line = " " . $line;	// add a space at the beginning so strpos can search correctly
				if (strpos($line, 'Saving') !== false) {
					// string found
					$returnObj->filename = trim(explode("as", $line)[1]);
					$returnObj->message = "Photo successfully taken and stored: '" . $returnObj->filename . "'";
					break 1;
				}
			}

			header('Content-Type: application/json');
			$returnObj->rv = $rv;
			echo json_encode($returnObj);
			break;

		case "deleteFile":
			$file = $_GET['file'];
			$path_parts = pathinfo('images/'.$file);
			unlink('images/'.$file);
			unlink($thumbsDir . $path_parts['basename'].'.jpg');
			header('Content-Type: application/json');
			echo json_encode(true);
			break;

		case "getImage":
/*
			$file = $_GET['file'];
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment; filename="'.$file.'"');
			header('Content-Length: '.filesize('images/'.$file));
			$fp = fopen('images/'.$file, 'rb');
			fpassthru($fp);
			//exit;
*/
			break;

		case "getCamera":
			exec ("gphoto2 --auto-detect", $output);
			//var_dump($output);	//debug
			$returnObj->success = false;
			$returnObj->camera = trim(explode("usb", $output[count($output) - 1])[0]);
			if (strpos(" " . $returnObj->camera, '-------------------------') !== false) {
				$returnObj->camera = "-- no camera detected --";
				$returnObj->error = "Camera not detected.";
			} else {
				$returnObj->success = true;
			}

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;

		case "getImages":
			$files = array();
			$imageDir = opendir('images');
			while (($file = readdir($imageDir)) !== false) {
				if(!is_dir('images/'.$file)){
					$path_parts = pathinfo('images/'.$file);
					if (!file_exists($thumbsDir . $path_parts['basename'].'.jpg')){
						try { //try to extract the preview image from the RAW
							CameraRaw::extractPreview('images/'.$file, $thumbsDir . $path_parts['basename'].'.jpg');
						} catch (Exception $e) { //else resize the image...
							//$im = new Imagick('images/'.$file);
							//$im->setImageFormat('jpg');
							//$im->scaleImage(1024,0);
							//$im->writeImage($thumbsDir . $path_parts['basename'].'.jpg');
							//$im->clear();
							//$im->destroy();
						}
					}
					$returnFile;
					$returnFile->name = $path_parts['basename'];
					$returnFile->sourcePath = 'images/'.$file;
					$returnFile->thumbPath = $thumbsDir . $path_parts['basename'].'.jpg';

					array_push($files,$returnFile);

					unset($returnFile);
				}
			}
			closedir($imageDir);
			$returnObj = $files;
			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;

		case "getCameraFiles":
			$pageNum     = $_GET['page'];
			$countOnPage = $_GET['count'];

			$returnObj = new stdClass();

			chdir ($thumbsDir);
			$returnObj = $gphoto->getCameraFiles($pageNum, $countOnPage);
			$returnObj->thumbsDir = $thumbsDir;

			header('Content-Type: application/json');
			echo json_encode ($returnObj);
			break;

		case "downloadImage":
			$fileID = $_GET['num'];
			$returnObj = $gphoto->getFile($fileID);

			if ($returnObj->success) {
				$fn = $returnObj->filename;
				// extracting the extension:
				$ext = substr($fn, strpos($fn,'.')+1);
				// initiate file download
				//header ("Content-Type: application/octet-stream");
				header ("Content-Type: application/" . $ext);
				header ("Content-Disposition: attachment; filename=" . $fn);
				header ("Content-Length: " . filesize ($fn));
				header ("Connection: close");
				readfile ($fn);
			}
			else {
				header('Content-Type: application/json');
				echo json_encode ($returnObj);
			}
			break;




			//exec ("gphoto2 --list-files 2>&1", $output, $rv);

			if (preg_match('/Error/', $output[0])) {	// check for Error
				$returnObj->error = trim(str_replace('*', '', $output[0]));
			} else {	// No Error
				$returnObj->files = array();
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
						$obj->dir		= $currentdir;
						$obj->num		= $arr[0];
						$obj->filename		= $arr[1];
						$obj->permissions	= $arr[2];
						$obj->filesize		= $arr[3];
						$obj->filesizeunit	= $arr[4];
						$obj->filetype		= $arr[5];
						array_push($returnObj->files, $obj);
					}
				}
			}

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;

		case "getListOfCameraFiles":
			$returnObj = $gphoto->getListOfFiles();

			header('Content-Type: application/json');
			echo json_encode ($returnObj);
			break;
			break;

		case "getCameraSettings":
			$returnObj = getCameraSettings(true);

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;
		case "setCameraSetting":
			$setting = $_GET['setting'];
			$value = $_GET['value'];
			if ($setting != null || $value != null) {	// good
				$returnObj = $gphoto->configSet($setting, $value);
			} else {
				$returnObj->success = false;
				$returnObj->error = "Missing settings";
			}

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;
		default:
			break;
	}
} catch (Exception $e) { //else resize the image...
	//echo $e;
	var_dump($e);
}

/////////////////////////////////////////////////////////////////////////////////
//
// FUNCTIONS
//

function getCameraSettings($includeOptions = true) {
	$returnObj = new stdClass();
	$gphoto = new gPhoto();

	$iso		= $gphoto->getISO();
	$aperture	= $gphoto->getAperture();
	$shutter	= $gphoto->getShutterSpeed();

	$returnObj->settings = array ();		// need to set the array object first
	$returnObj->success = false;

	if ($includeOptions) {
		if ($iso->success) {
			array_push($returnObj->settings,
					$iso,
					$aperture,
					$shutter
			);
			$returnObj->success = true;
		}
	} else {
		array_push($returnObj->settings,
				justCurrent($iso),
				justCurrent($aperture),
				justCurrent($shutter)
		);
	}
	$returnObj->success = true;
	return $returnObj;
}


function justCurrent($data) {
	return array(
		"label" => $data->label,
		"current" => $data->current
	);
}


function getFileDownload ( $fileID ) {

}

?>
