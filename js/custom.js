// Global variables
var CAMERAFILES;
var PHOTOSPERPAGE = 50;
var CAMERAFILESPAGENUM;


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
//$(document).on( "pageshow","#page-three", load);

// load at the start
function initialPageLoad() {
	disableAllCameraFunctions();
	loadCameraName();
	loadCameraSettings();
	loadCameraFiles(1);
}

function enableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", false);
	$("#page-two :input").attr("disabled", false);
	$("#page-three :input").attr("disabled", false);
}
function disableAllCameraFunctions() {
	$("#page-one :input").attr("disabled", true);
	$("#page-two :input").attr("disabled", true);
	$("#page-three :input").attr("disabled", true);
}

function loadCameraName() {
	$.ajax({
		url: "service.php?action=getCamera",
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

function loadCameraSettings() {
	//setPage1Alert("Loading camera settings...");
	$.ajax({
		url: "service.php?action=getCameraSettings",
		dataType: "json",
		success: function (data) {

			displayCameraSettings(data);

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
	disableAllCameraFunctions();
	displayLoading("Loading camera photos...");

	// compare if the current page has already been loaded
	if (isNaN( page ) || page == CAMERAFILESPAGENUM) {
		console.log("Page " + page + " has already been loaded. Ignoring.");
	}
	// new page, so let's load
	else {
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
	if (data.success) {
		enableAllCameraFunctions();
	}
	else {
		setAlertOnPage("#alertContainer1", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
		setAlertOnPage("#alertContainer2", "danger", "Problem!", "Could not detect a camera. All functionality is turned off.");
	}
}

function displayCameraSettings(data){
	var settingsHTML = "";

	//console.log("displayCameraSettings");
	//console.log(data);

	if (data.success) {	// success
		for(var i = 0; data.settings != null && i < data.settings.length; i++){
			var setting = data.settings[i];
			//console.log(setting);
			html = $("#settingsHTML").text();
			html = html.replace(/@settingName/g, setting.configName);
			html = html.replace(/@labelName/g, setting.label);
			html = html.replace(/@settingConfig/g, setting.config);
			lineItems = "";
			for (var x = 0; x < setting.cameraSettings.length; x++) {
				line = $("#settingLineItemHTML").text();
				line = line.replace(/@index/g, setting.cameraSettings[x].index);
				line = line.replace(/@value/g, setting.cameraSettings[x].value);
				selected = "";
				if (setting.cameraSettings[x].value == setting.current) { selected = " selected "; }
				line = line.replace(/@selected/g, selected);
				lineItems += line;
			}
			html = html.replace(/@settingLineItems/g, lineItems);
			if (i == 0) {
				$("#settingsContainer").html( html );
			} else {
				$("#settingsContainer").append( html );
			}
		}
		clearPage1Alert();
	} else {	// error
		$("#settingsContainer").html("Could not retrieve camera settings.");
	}

	// Enable CSS on the new DOM objects
	$("#settingsContainer").enhanceWithin();
}

function displayCameraFiles (page) {
	console.log("CameraFiles Page: " + page);

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
					html = $("#cameraThumbsHTML").text();
					html = html.replace(/@thumbURL/g, thumbsDir + thumb.name);
					html = html.replace(/@imageURL/g, "/service.php?action=downloadImage&num=" + thumb.num);
					html = html.replace(/@imageLabel/g, CAMERAFILES[thumb.num - 1].filename);
					html = html.replace(/@imageAlt/g, CAMERAFILES[thumb.num - 1].filename);
					$("#cameraThumbsContainer").append( html );
				}
				//console.log(items);

				// Enable CSS
				$("#cameraThumbsContainer").enhanceWithin();
				// display pagination, if necessary
				displayPagination(page);

				// clear alert
				enableAllCameraFunctions();
				hideLoading();
				clearPage2Alert();
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
				// show successful message
				setPage1Alert(data.message);
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
	console.log(setting);
	console.log(value);

	$.ajax({
		url: "service.php?action=setCameraSetting&setting=" + setting + "&value=" + value,
		dataType : "json",
		success: function(data){

			//console.log(data);
			enableAllCameraFunctions();
			hideLoading()

			if (data.success) {
				// show successful message
				setPage1Alert(data.message);
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
