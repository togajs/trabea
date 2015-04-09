/*global hljs */
(function() {
	'use strict';

	function fetch(url, cb) {
		var xhr = new XMLHttpRequest();

		xhr.onload = function () {
			if (this.status === 200) {
				cb(this.response);
			}
		};

		xhr.open('GET', url, true);
		xhr.send();
	}

	fetch('data.json', function (response) {
		console.log(JSON.parse(response));
	});

	hljs.initHighlightingOnLoad();

}());
