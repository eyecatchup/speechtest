chrome.app.runtime.onLaunched.addListener(function() {
	//chrome.app.window.create('spect2.html?file=sound/book_sample1.mp3', {
	chrome.app.window.create('appMain.html', {
		//chrome.app.window.create('appFrame.html?file=sound/book_sample1.mp3', {
		//chrome.app.window.create('appFrame.html', {
		'bounds': {
			'width': 565,
			'height': 350
		},
		'frame': "none"
	});
});


