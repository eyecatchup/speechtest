$(document).on("ready", function() {
	//$(".testDiv").show();
	var selectedPreset = "voice";

	$(".goBtn").on("click", function() {
		var url = "";
		var aInput = $("input:radio[name=aInput]:checked").val();
		var aPreset = $("input:radio[name=aPreset]:checked").val();
		//var aPosition = $("input:radio[name=aPosition]:checked").val();
		if (aInput == "microphone")
			url = "appFrame-mic.html?";
		else if (aInput == "userFile")
			url = "appFrame.html?";
		else if (aInput == "demo")
			url = "appFrame.html?file=" + $(".audioFile").val();
		url += aPreset;
		
		/*var bounds = { 'width': 999, 'height': 350 };
		if (true || aPosition == "top") {
			bounds = {
				'width': Math.round(window.screen.availWidth*1), 
				'height': 200, 'top': 0, 'left': 0
			}
		}*/
		
		if (aInput == undefined) {
			$(".warningBox").html("<b>Please select a mode from above!</b>");
		}
		else {
			$(".debug1").html("input: " + aInput + "; url: " + url);
			chrome.app.window.create(url, {
				/*'id': "appFrame",*/
				'bounds': {
					//'width': 999,
					//'width': Math.round(window.screen.availWidth*1),
					'width': Math.max(500, Math.round(window.screen.availWidth*0.8)),
					'height': 350
				},
				'frame': "none"
			});
		}
	});

	// Preset radio buttons
	$(".jsPresetRdo").on("change", function() {
		selectedPreset = $(this).parent().data("presetname");
		$(".presetLbl").removeClass("presetChecked");
		$(this).parent().addClass("presetChecked");
		$(".jsPresetDesc").css("display", "none");
		$(".jsPresetDesc_" + selectedPreset).css("display", "block");
	});
	/*$(".presetLbl").on("mouseover", function() {
		$(".jsPresetDesc").css("display", "none");
		$(".jsPresetDesc_" + $(this).data("presetname")).css("display", "block");
	});
	$(".presetLbl").on("mouseout", function() {
		$(".jsPresetDesc").css("display", "none");
		$(".jsPresetDesc_" + selectedPreset).css("display", "block");
	});*/
	
});
