// Global variables
var MAXPHOTOSTOTAKE = 4;
var PHOTOSTAKEN = 0;
var COUNTDOWN = 3;

var CAMERAFILES;
var PHOTOSPERPAGE = 100;
var CAMERAFILESPAGENUM;
var ALLCAMERASETTINGS = null;


function setPage1Alert (msg) {
	setAlertOnPage ("#alertContainer1", "info", "Info:", msg);
}
function setPage2Alert (msg) {
	setAlertOnPage ("#alertContainer2", "info", "Info:", msg);
}
function setAlertOnPage (container, alertClass, alertType, msg) {
	html = $("#alertHTML").text();
	html = html.replace(/@link/g, "#");
	html = html.replace(/@alertClass/g, alertClass);
	html = html.replace(/@alertType/g, alertType);
	html = html.replace(/@message/g, msg);

/*	$("#alertMessage").fadeOut(2000,500).slideUp(500, function() {
		$("#alertMessage").alert('close');
	});
*/

	$( container ).html( html );
}
function clearPage1Alert () {
	clearAlertOnPage ("#alertContainer1");
}
function clearPage2Alert () {
	clearAlertOnPage ("#alertContainer2");
}
function clearAlertOnPage ( container ) {
	$( container ).html("");
}



$(document).ready( initialPageLoad );
//$(document).on( "pageshow","#page-one", loadCaptureSettings);
//$(document).on( "pageshow","#page-two", loadCameraFiles);

$(document).on( "pageshow","#page-one", initialPageLoad);
$(document).on( "pageshow","#page-three", startCountdown);

// load at the start
function initialPageLoad() {
	//disableAllCameraFunctions();
	//loadCameraName();

	COUNTDOWN = 3;
}


function setCountdownText( txt ) {
	console.log("Countdown: " + txt);
	$("#divCountdown").text(txt);

	// Enable CSS
	$("#divCountdown").enhanceWithin();
}

function startPhotobooth() {
	$.mobile.changePage( $("#page-three") );
}

function startCountdown() {
	setCountdownText( COUNTDOWN );

	COUNTDOWN = COUNTDOWN-1;

	if (COUNTDOWN < 0) {
		// take picture
		setCountdownText("!!!");
		takePicture();
		COUNTDOWN = 3;
	} else {
		// start timer
		window.setTimeout( startCountdown, 1000 );
	}
}


function takePicture(){

	//disableAllCameraFunctions();
	displayLoading("Taking Photo...");

	$.ajax({
		url: "service-photobooth.php?action=takePictureAndDownload",
		dataType : "json",
		success: function(data){

			//console.log(data);
			//enableAllCameraFunctions();

			if (data.success) {
				// success
				
			} else {
				setAlertOnPage("#alertContainer1", "danger", "Problem!", data.error);
			}

			hideLoading()

		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}



function disableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", true);
	$("#page-two :input").attr("disabled", true);
}
function enableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", false);
	$("#page-two :input").attr("disabled", false);
}

function loadCameraName() {
	$.ajax({
		url: "service.php?action=getCameraName",
		dataType: "json",
		success: function (data) {

			displayCameraName(data);

		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function loadPrevCameraFiles() {
	if (CAMERAFILESPAGENUM != null && CAMERAFILESPAGENUM > 2) {
		loadCameraFiles(CAMERAFILESPAGENUM - 1);
	}
}
function loadNextCameraFiles() {
	if (CAMERAFILESPAGENUM != null) {
		loadCameraFiles(CAMERAFILESPAGENUM + 1);
	}
}
function loadCameraFiles(page) {
	if ( page == undefined || isNaN(page) ) {
		// check if a previous page was loaded
		if (isNaN(CAMERAFILESPAGENUM)) {
			page = 1;
		} else {
			page = CAMERAFILESPAGENUM;
		}
	}


	// compare if the current page has already been loaded
	if (page == CAMERAFILESPAGENUM) {
		console.log("Page " + page + " has already been loaded. No need to load again.");
	}
	// new page, so let's load
	else {
		//disableAllCameraFunctions();
		displayLoading("Loading camera photos...");

		//console.log("Loading camera files...");

		$.ajax({
			url: "service.php?action=getListOfCameraFiles",
			dataType: "json",
			success: function (data) {

				// set global variable
				CAMERAFILES = data.files;

				CAMERAFILESPAGENUM = page;
				displayCameraFiles( CAMERAFILESPAGENUM );

			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				console.log(ajaxOptions);
				console.log(thrownError);
			}
		});
	}
}

function displayCameraName (data) {
	if (data.success) {
		enableAllCameraFunctions();
	}
	else {
		setAlertOnPage("#alertContainer1", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
		setAlertOnPage("#alertContainer2", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
	}
}

function displayCameraFiles (page) {
	console.log("Loading Camera files on page: " + page);

	$.ajax({
		url: "service.php?action=getCameraFiles&page=" + page + "&count=" + PHOTOSPERPAGE,
		dataType: "json",
		success: function (data) {

			if (data.success) {	// success
				// clear container first
				$("#cameraThumbsContainer").html("");
				//console.log("Data::");
				//console.log(data);
				// Add each photo to the array, and the page
				var items = new Array();
				var thumbsDir = data.thumbsDir
				var html = "";
				for (i = 0; i < data.filenames.length; i++) {
					var thumb     = data.filenames[i];
					var fullImage = "";
					// add photo to page
					$("#cameraThumbsContainer");
					html = "";
					if (thumb.extension == "JPG" || thumb.extension == "JPEG") {
						html = $("#cameraThumbsHTMLORI").text();
					} else if (thumb.extension == "MOV" || thumb.extension == "MP4") {
						html = $("#cameraThumbsHTMLORI").text();
					} else {
						html = $("#cameraThumbsHTMLJPG").text();
					}
					html = html.replace(/@thumbURL/g, thumbsDir + thumb.name);
					html = html.replace(/@downloadURLJPG/g, "/service.php?action=downloadImageJPG&num=" + thumb.num);
					html = html.replace(/@downloadURLORI/g, "/service.php?action=downloadImageORI&num=" + thumb.num);
					html = html.replace(/@imageLabel/g, CAMERAFILES[thumb.num - 1].filename);
					html = html.replace(/@imageAlt/g, CAMERAFILES[thumb.num - 1].filename);
					html = html.replace(/@extension/g, thumb.extension);
					html = html.replace(/@downloadFileNum/g, thumb.num);
					$("#cameraThumbsContainer").append( html );
				}
				//console.log(items);

				// Enable CSS
				$("#cameraThumbsContainer").enhanceWithin();
				// display pagination, if necessary
				displayPagination(page);

				// clear alert
				hideLoading();
				clearPage2Alert();
				enableAllCameraFunctions();
			} else {	// error; clear the div container
				$("#cameraThumbsContainer").html("No camera detected");
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}
function displayPagination(page) {
	// clear pagination
	$("#paginationTop").html("");
	$("#paginationBottom").html("");

	// set pagination, if necessary
	if (CAMERAFILES.length > PHOTOSPERPAGE) {
		var html = "";
		var nexthtml = "";
		var last = lastPage();
		if (page > 1) {			// prev
			html = $("#paginationPrevHTML").text();
		}
		if (page < last) {	// next
			nexthtml = $("#paginationNextHTML").text();
		}

		// determine how many pages there are
		for (i = 1; i <= last; i++) {
			if (page == i) {
				itemhtml = $("#paginationItemDisabledHTML").text();
			} else {
				itemhtml = $("#paginationItemHTML").text();
			}
			itemhtml = itemhtml.replace(/@pageNum/g, i);
			itemhtml = itemhtml.replace(/@text/g, i);
			
			html += itemhtml;
		}
		html += nexthtml;

		// display pagination elements
		$("#paginationTop").html(html);
		$("#paginationBottom").html(html);
		// enable CSS
		$("#paginationTop").enhanceWithin();
		$("#paginationBottom").enhanceWithin();
	}
}
function lastPage() {
	var last = Math.ceil(CAMERAFILES.length / PHOTOSPERPAGE);
	return last;
}
function prepareDownload (fileNum, convertToJPG) {
	console.log("Preparing to download file: " + fileNum);
	displayLoading("Retrieving file from camera...");
	disableAllCameraFunctions();

	action = "prepareDownloadORI";
	if (convertToJPG) {
		action = "prepareDownloadJPG";
		displayLoading("Retrieving and converting image to JPG... Could take some time...");
	}

	$.ajax({
		url: "service.php?action=" + action + "&num=" + fileNum,
		dataType : "json",
		success: function(data){

			console.log(data);
			enableAllCameraFunctions();
			hideLoading();

			if (data.success) {
				// success; initiate download
				//console.log("INITIATE DOWNLOAD: " + data.filename);
				window.open(data.filename, "_blank");
			} else {
				setAlertOnPage("#alertContainer2", "danger", "Problem!", data.error);
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);

			hideLoading();
		}
	});
}



function displayLoading(myText) {
        $.mobile.loading( 'show', {
                text: myText,
                textVisible: true,
                theme: 'a'
        });
}
function hideLoading() {
	$.mobile.loading('hide');
}


function captureSettingChange ( setting, value ){
	disableAllCameraFunctions();
	displayLoading("Changing camera setting...");

	//console.log(setting);
	//console.log(value);

	$.ajax({
		url: "service.php?action=setCameraSetting&setting=" + setting + "&value=" + value,
		dataType : "json",
		success: function(data){

			//console.log(data);
			enableAllCameraFunctions();
			hideLoading()

			if ( ! data.success) {
				setAlertOnPage("#alertContainer3", "danger", "Problem!", data.error);
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function loadStorage() {
	$.ajax({
		url: "service.php?action=getRPIStorage",
		dataType : "json",
		success: function(data){

			//console.log(data);
			enableAllCameraFunctions();
			hideLoading();

			var text = "There is " + data.freeMB.toFixed(1) + "MB free of " + data.totalMB.toFixed(2) + "MB total storage";
			$("#piSettingsContainer").text( text );
		},
		error: function (xhr, ajaxOptions, thrownError) {
			enableAllCameraFunctions();
			hideLoading();

			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function clearTempFiles() {
	displayLoading("Deleting temporary files on the RPi...");
	$.ajax({
		url: "service.php?action=clearTempFiles",
		dataType : "json",
		success: function(data){

			//console.log(data);
			hideLoading();

			if (data.success) {
				setPage3Alert("Successfully cleared files from RPi");
			} else {
				setAlertOnPage("#alertContainer3", "danger", "Problem!", data.error);
			}

			// refresh storage line
			loadStorage();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			enableAllCameraFunctions();
			hideLoading();

			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function downloadFromCamera( num ) {
	console.log("Delete: " + num);
}
