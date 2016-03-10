// Global variables
var CAMERAFILES;
var PHOTOSPERPAGE = 100;
var CAMERAFILESPAGENUM;
var ALLCAMERASETTINGS;


function setPage1Alert (msg) {
	setAlertOnPage ("#alertContainer1", "info", "Info:", msg);
}
function setPage2Alert (msg) {
	setAlertOnPage ("#alertContainer2", "info", "Info:", msg);
}
function setPage3Alert (msg) {
	setAlertOnPage ("#alertContainer3", "info", "Info:", msg);
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
function clearPage3Alert () {
	clearAlertOnPage ("#alertContainer3");
}
function clearAlertOnPage ( container ) {
	$( container ).html("");
}



// hide first alert
/*
window.setTimeout(function() {
	$(".flash").fadeTo(500, 0).slideUp(500, function(){
		$(this).remove();
	});
}, 5000);
*/


$(document).ready( initialPageLoad );
//$(document).on( "pageshow","#page-one", loadTakePicture);
$(document).on( "pageshow","#page-two", loadCameraFiles);
//$(document).on( "pageshow","#page-three", load);

// load at the start
function initialPageLoad() {
	disableAllCameraFunctions();
	loadCameraName();
	loadCaptureSettings();
	//loadCameraFiles(1);
	loadAllCameraSettings();
}

function disableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", true);
	$("#page-two :input").attr("disabled", true);
	$("#page-three :input").attr("disabled", true);
}
function enableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", false);
	$("#page-two :input").attr("disabled", false);
	$("#page-three :input").attr("disabled", false);
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

function loadCaptureSettings() {
	//setPage1Alert("Loading camera settings...");
	$.ajax({
		url: "service.php?action=getCaptureSettings",
		dataType: "json",
		success: function (data) {

			displayCaptureSettings(data);

		}
	});
}

function loadAllCameraSettings() {
	setPage3Alert("Loading all camera settings...");
	$.ajax({
		url: "service.php?action=getAllCameraSettings",
		dataType: "json",
		success: function (data) {

			displayAllCameraSettings(data);

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
		disableAllCameraFunctions();
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
	$("#cameraName1").text(data.camera);
	$("#cameraName2").text(data.camera);
	$("#cameraName3").text(data.camera);
	if (data.success) {
		enableAllCameraFunctions();
	}
	else {
		setAlertOnPage("#alertContainer1", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
		setAlertOnPage("#alertContainer2", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
		setAlertOnPage("#alertContainer3", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
	}
}

function displayCaptureSettings(data){
	var settingsHTML = "";

	//console.log("displayCameraSettings");
	//console.log(data);

	if (data.success) {	// success
		for(var i = 0; data.settings != null && i < data.settings.length; i++){
			var setting = data.settings[i];
			//console.log(setting);
			html = $("#captureSettingsHTML").text();
			html = html.replace(/@settingName/g, setting.configName);
			html = html.replace(/@labelName/g, setting.label);
			html = html.replace(/@settingConfig/g, setting.config);
			lineItems = "";
			for (var x = 0; x < setting.cameraSettings.length; x++) {
				line = $("#captureSettingLineItemHTML").text();
				line = line.replace(/@index/g, setting.cameraSettings[x].index);
				line = line.replace(/@value/g, setting.cameraSettings[x].value);
				selected = "";
				if (setting.cameraSettings[x].value == setting.current) { selected = " selected "; }
				line = line.replace(/@selected/g, selected);
				lineItems += line;
			}
			html = html.replace(/@settingLineItems/g, lineItems);
			if (i == 0) {
				$("#captureSettingsContainer").html( html );
			} else {
				$("#captureSettingsContainer").append( html );
			}
		}
		clearPage1Alert();
	} else {	// error
		$("#captureSettingsContainer").html("Could not retrieve camera settings.");
	}

	// Enable CSS on the new DOM objects
	$("#captureSettingsContainer").enhanceWithin();
}

function displayAllCameraSettings(data){
	ALLCAMERASETTINGS = data.config;

	//console.log(data);

	$("#page-three").enhanceWithin();

	if (data.success) {	// success
		for(var i = 0; data.config != null && i < data.config.length; i++){
			var setting = data.config[i];
			//console.log(setting);
			html = $("#cameraSettingHTML").text();
			html = html.replace(/@setting/g, setting);
			html = html.replace(/@text/g, setting);
			$("#cameraSettingsContainer").append( html );
		}
	}

	// Enable CSS on the new DOM objects
	$("#cameraSettingsContainer").listview("refresh");	// refresh the listview after an update
	$("#cameraSettingsContainer").enhanceWithin();
	clearPage3Alert();
}

function loadCameraSetting ( setting ) {
	displayLoading("Loading setting from Camera...");
	//setPage3Alert("Loading setting...");
	//console.log(setting);

	$.ajax({
		url: "service.php?action=getCameraSetting&setting=" + setting,
		dataType: "json",
		success: function (data) {

			displayCameraSetting( data );

			hideLoading();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}
function displayCameraSetting ( data ) {
	console.log(data);
	console.log(data.type);

	list = "";
	for (i = 0; i < data.cameraSettings.length; i++) {
		selected = "";
		if (data.cameraSettings[i].value == data.current) {
			selected = "selected";
console.log("SELECTED");
		}
			// Types:
			// TOGGLE
			// RADIO
			// OPTION
			// DATE
			// TEXT

		lihtml = $("#panelLiHTML").text();
		lihtml = lihtml.replace(/@index/g, data.cameraSettings[i].index);
		lihtml = lihtml.replace(/@value/g, data.cameraSettings[i].value);
		lihtml = lihtml.replace(/@selected/g, selected);
		list += lihtml;
	}

	html = $( "#panelHTML" + data.type.toUpperCase() ).text();
	html = html.replace(/@labelName/g, data.label);
	html = html.replace(/@type/g, data.type);
	html = html.replace(/@settingLineItems/g, list);
	html = html.replace(/@settingName/g, data.configName);
	html = html.replace(/@settingConfig/g, data.config);
	html = html.replace(/@settingCurrent/g, data.current);
	// TOGGLE
	if (data.type == "TOGGLE") {
		settingOn  = "";
		settingOff = "";
		if (data.current == 0) {
			settingOff = "selected";
		} else {
			settingOn = "selected";
		}
		html = html.replace(/@toggleSettingOff/g, settingOff);
		html = html.replace(/@toggleSettingOn/g, settingOn);
	}
	$("#cameraSettingsPanel").html( html );

	// Enable CSS
	$("#cameraSettingsPanel").enhanceWithin();

	// open panel
	$("#cameraSettingsPanel").panel("open");
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


function takePicture(){

	disableAllCameraFunctions();
	displayLoading("Taking Photo...");

	$.ajax({
		url: "service.php?action=takePicture",
		dataType : "json",
		success: function(data){

			//console.log(data);
			enableAllCameraFunctions();
			hideLoading()

			if (data.success) {
				// success
			} else {
				setAlertOnPage("#alertContainer1", "danger", "Problem!", data.error);
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
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
			enableAllCameraFunctions();
			hideLoading();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}
