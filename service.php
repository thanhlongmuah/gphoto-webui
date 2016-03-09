<?php
require_once("gPhoto.php");

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
			header('Content-Type: application/json');
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

		case "getCameraName":
			$returnObj = $gphoto->getCameraName();

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
			$dir = "./tmp/";

			if ($returnObj->success) {
				$fn = $returnObj->filename;
				// extracting the extension:
				$ext = substr($fn, strpos($fn,'.')+1);
				// initiate file download
				header ("Content-Type: application/octet-stream");
				header ("Content-Type: application/" . $ext);
				header ("Content-Disposition: attachment; filename=" . $fn);
				header ("Expires: 0");
				header ("Content-Length: " . filesize ($dir . $fn));
				header ("Connection: close");
				readfile ($dir . $fn);
			}
			else {
				$fn = realpath($dir . $returnObj->filename);
				$ext = substr($fn, strpos($fn,'.')+1);
				$returnObj->ext = $ext;
				$returnObj->fn = $fn;

				header('Content-Type: application/json');
				echo json_encode ($returnObj);
			}
			break;

		case "getListOfCameraFiles":
			$returnObj = $gphoto->getListOfFiles();

			header('Content-Type: application/json');
			echo json_encode ($returnObj);
			break;
			break;

		case "getCaptureSettings":
			$returnObj = getCaptureSettings();

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;
		case "getAllCameraSettings":
			$returnObj = $gphoto->configList();

			header('Content-Type: application/json');
			echo json_encode($returnObj);
			break;

		case "getCameraSetting":
			$setting = $_GET['setting'];
			if ($setting != null) {	// good
				$returnObj = $gphoto->configGet($setting);
			} else {
				$returnObj->success = false;
				$returnObj->error = "Missing settings";
			}

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

function getCaptureSettings() {
	$returnObj = new stdClass();
	$gphoto = new gPhoto();

	$iso		= $gphoto->getISO();
	$aperture	= $gphoto->getAperture();
	$shutter	= $gphoto->getShutterSpeed();

	$returnObj->settings = array ();		// need to set the array object first
	$returnObj->success = false;

	if ($iso->success) {
		array_push($returnObj->settings,
				$iso,
				$aperture,
				$shutter
		);
		$returnObj->success = true;
	}
	return $returnObj;
}


?>
