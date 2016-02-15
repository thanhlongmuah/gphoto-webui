
window.setTimeout(function() {
	$(".flash").fadeTo(500, 0).slideUp(500, function(){
		$(this).remove();
	});
}, 5000);


$(document).ready ( function() {
	console.log("JS Loaded...");

	setAlert("Loading camera photos...");

/*	$.ajax({
		url: "service.php?action=getCameraPhotos",
		dataType: "json",
		success: function (data) {
			getCameraPhotos(data);
		}
	});
*/

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
});


function getCamera (data) {
	$("#cameraName").text(data.camera);
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

		$("#settingsContainer").append(html);
	}

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


function settingChange () {
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


function takePicture(){
        $.mobile.loading( 'show', {
                text: 'Taking Image....',
                textVisible: true,
                theme: 'a'
        });


        $.ajax({
                url: "service.php?action=takePicture",
                dataType : "json",
                success: function(data){
                        //$.mobile.loading('hide');

                        // show successful message
                        $.mobile.loading( 'show', {
                                text: data.message,
                                textVisible: true,
                                theme: 'a'
                        });

                        //delay not working yet..
                        //$.mobile.delay(100).loading('hide');
                },
        });
}
