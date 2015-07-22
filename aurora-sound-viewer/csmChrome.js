var csmChrome = {};

// Call initially, and when window is resized.
csmChrome.OnWindowResize = function() {
	if ($(".jsHeightToBottom").length) {
		var bodyMargin = 3;
		var h = $(window).height() - $(".jsHeightToBottom").offset().top;
		$(".jsHeightToBottom").height(h - bodyMargin);
	}
}

// Call Init after dom is ready
csmChrome.Init = function() {
	var $minimizeBtn = $('.windowBtn_min');
	var $maximizeBtn = $('.windowBtn_max');
	var $closeBtn = $('.windowBtn_close');

	$(window).on("focus", function() {
		$("body").addClass("hasFocus");
	});
	$(window).on("blur", function() {
		//$("body").addClass("hasBlur");
		$("body").removeClass("hasFocus");
	});

	if (chrome.app.window) {
		var curWin = chrome.app.window.current();
		$minimizeBtn.on("click", function() {
			curWin.minimize();
		});
		$maximizeBtn.on("click", function() {
			if (curWin.isMaximized())
				curWin.restore();
			else
				curWin.maximize();
		});
		$closeBtn.on("click", function() {
			curWin.close();
		});
	}
	
	// Wireup jsHeightToBottom element.
	setTimeout(csmChrome.OnWindowResize, 50);
	$(window).on("resize", function() {
		csmChrome.OnWindowResize();
	});
	
}

// Auto-wire-up:
//$(document).ready( function() {
window.addEventListener('load', function() {
	csmChrome.Init();
});
