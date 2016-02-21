
// Global variables
var CAMERAFILES;
var PHOTOSPERPAGE = 20;

window.setTimeout(function() {
	$(".flash").fadeTo(500, 0).slideUp(500, function(){
		$(this).remove();
	});
}, 5000);


$(document).ready( loadTakePicture );

function loadTakePicture() {
	console.log("JS Loaded...");

	loadCameraName();
	loadCameraSettings();
	loadPhotos(1);
}


function loadCameraSettings() {
	setAlert("Loading camera settings...");
	$.ajax({
		url: "service.php?action=getCameraSettings",
		dataType: "json",
		success: function (data) {
	console.log("Camera Settings...");
			getCameraSettings(data);
		}
	});
}


function loadCameraName() {
	$.ajax({
		url: "service.php?action=getCamera",
		dataType: "json",
		success: function (data) {
			getCamera(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}


function loadPhotos(page) {
	console.log("Loading camera files...");
	$.ajax({
		url: "service.php?action=getListOfCameraFiles",
		dataType: "json",
		success: function (data) {

			// set global variable
			CAMERAFILES = data.files;

			//displayCameraFiles (page);


			console.log(CAMERAFILES);
			//$("#photosContainer").append("<img src='/images/thumbs/thumb_" + files[0].filename + ".jpg'>");

			start = ((page - 1) * PHOTOSPERPAGE) + 1;
			end   = start + PHOTOSPERPAGE;

			//console.log(start);
			//console.log(end);

			for (i = start; i < end; i++) {
				image = CAMERAFILES[i].filename;
				console.log(i);
				console.log(image);

				// add each image
			}


			/////////////////////////////////////////////////////////////////////
			// PhotoSwipe
			var pswpElement = document.querySelectorAll('.pswp')[0];

			// build items array
			var items = [
				{
					src: "/images/thumbs/thumb_" + CAMERAFILES[0].filename + ".jpg",
					w: 600,
					h: 400
				},
				{
					src: "/images/thumbs/thumb_" + CAMERAFILES[1].filename + ".jpg",
					w: 1200,
					h: 900
				}
			];

			// define options (if needed)
			var options = {
				// optionName: 'option value'
				// for example:
				index: 0 // start at first slide
			};

			// Initializes and opens PhotoSwipe
			//var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
			var gallery = new PhotoSwipe( pswpElement, false, items, options);
			gallery.init();


		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
		}
	});
}

function displayCameraFiles (page) {
}


$(document).on( "pageshow","#photos", loadPhotos);

$(document).on( "pageshow","#take-picture", loadTakePicture);



function getCamera (data) {
	$("#cameraName1").text(data.camera);
	$("#cameraName2").text(data.camera);
}


function getCameraSettings(data){
	var settingsHTML = "";
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

	// Enable CSS
	$("#settingsContainer").enhanceWithin();
	clearAlert();
}



function setAlert (msg) {
	html = $("#alertHTML").text();
	html = html.replace(/@link/g, "#");
	html = html.replace(/@message/g, msg);

/*	$("#alertMessage").fadeOut(2000,500).slideUp(500, function() {
		$("#alertMessage").alert('close');
	});*/

	$("alertContainer").html(html);
}
function clearAlert () {
	$("#alertContainer").html("");
}


function settingChangeClick () {
	//console.log(this);
	
}



function updateCameraGalleryGrid(data){
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


function takePicture(){

	displayLoading("Taking Image...");

        $.ajax({
                url: "service.php?action=takePicture",
                dataType : "json",
                success: function(data){
			hideLoading()

                        // show successful message
			//displayLoading(data.message);
console.log(data);

                },
        });
}
