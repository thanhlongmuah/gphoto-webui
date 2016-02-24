// Global variables
var CAMERAFILES;
var PHOTOSPERPAGE = 30;
var CAMERAPHOTOSPAGENUM;


function setPage1Alert (msg) {
	setAlertOnPage ("#alertContainer1", msg);
}
function setPage2Alert (msg) {
	setAlertOnPage ("#alertContainer2", msg);
}
function setAlertOnPage (container, msg) {
	html = $("#alertHTML").text();
	html = html.replace(/@link/g, "#");
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



// page transitions? need to confirm
window.setTimeout(function() {
	$(".flash").fadeTo(500, 0).slideUp(500, function(){
		$(this).remove();
	});
}, 5000);



$(document).ready( loadTakePicture );
//$(document).on( "pageshow","#page-one", loadTakePicture);
//$(document).on( "pageshow","#page-two", loadCameraFiles);

// load at the start
function loadTakePicture() {
	loadCameraName();
	loadCameraSettings();
	loadCameraFiles(1);
}

function loadCameraSettings() {
	setPage1Alert("Loading camera settings...");
	$.ajax({
		url: "service.php?action=getCameraSettings",
		dataType: "json",
		success: function (data) {

			displayCameraSettings(data);

		}
	});
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

function loadCameraFiles(page) {
	// compare if the current page has already been loaded
	if (isNaN( page ) || page == CAMERAPHOTOSPAGENUM) {
		console.log("Page " + page + " has already been loaded. Ignoring.");
	}
	// new page, so let's load
	else {
		console.log("Loading camera files...");

		$.ajax({
			url: "service.php?action=getListOfCameraFiles",
			dataType: "json",
			success: function (data) {

				// set global variable
				CAMERAFILES = data.files;

				CAMERAPHOTOSPAGENUM = page;
				displayCameraFiles( CAMERAPHOTOSPAGENUM );

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
}

function displayCameraFiles (page) {
	setPage2Alert("Loading camera photos...");
	console.log("Page to load: " + page);

	$.ajax({
		url: "service.php?action=getCameraFiles&page=" + page + "&count=" + PHOTOSPERPAGE,
		dataType: "json",
		success: function (data) {

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
				html = html.replace(/@imageLabel/g, CAMERAFILES[thumb.num].filename);
				html = html.replace(/@imageAlt/g, CAMERAFILES[thumb.num].filename);
				$("#cameraThumbsContainer").append( html );
			}
			//console.log(items);

			// Enable CSS
			$("#settingsContainer").enhanceWithin();

		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function displayCameraSettings(data){
	var settingsHTML = "";

	console.log("displayCameraSettings");
	console.log(data);

	for(var i = 0; data.settings != null && i < data.settings.length; i++){
		var setting = data.settings[i];

		//console.log(setting);

		html = $("#settingsHTML").text();
		html = html.replace(/@settingName/g, setting.configName);
		html = html.replace(/@labelName/g, setting.label);

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

	// Enable CSS on the new DOM objects
	$("#settingsContainer").enhanceWithin();
	clearPage1Alert();
}


function takePicture(){

	displayLoading("Taking Photo...");

	$.ajax({
		url: "service.php?action=takePicture",
		dataType : "json",
		success: function(data){

			console.log(data);
			hideLoading()

			// show successful message
			setPage1Alert(data.message);
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






function ddddddupdateCameraGalleryGrid(data){
	var galleryHTML = "";

	console.log(data);

	var image = "";
	for (var i = 0; i < data.files.length; i++) {
		image = data.files[i];

		$("#cameraGalleryGrid").append("<div class='ui-block-b'>");
		$("#cameraGalleryGrid").append("<p><img src='' /></p>");
		$("#cameraGalleryGrid").append("<p>" + image.filename + "</p>");
		$("#cameraGalleryGrid").append("<p></p>");
		$("#cameraGalleryGrid").append("");
		$("#cameraGalleryGrid").append("</div>\n");
	}
}
