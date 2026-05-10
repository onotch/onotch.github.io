$(document).ready(function() {
	'use strict';

	var SS_VALUES = [1/8000, 1/6400, 1/5000, 1/4000, 1/3200, 1/2500, 1/2000, 1/1600, 1/1250, 1/1000, 1/800, 1/640,
		1/500, 1/400, 1/320, 1/250, 1/200, 1/160, 1/125, 1/100, 1/80, 1/60, 1/50, 1/40, 1/30, 1/25, 1/20, 1/15,
		1/13, 1/10, 1/8, 1/6, 1/5, 1/4, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.3, 1.6, 2, 2.5, 3.2, 4, 5, 6, 8, 10, 13,
		15, 20, 25, 30, 40, 50, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480, 540, 600, 900, 1200, 1500, 1800,
		2400, 3000, 3600];
	var ND_VALUES = [1, 2, 4, 8, 16, 32, 64, 100, 128, 200, 256, 400, 500, 1000, 2000, 8000, 10000, 16000, 32000, 64000, 100000, 1000000];

	var SS_VALUE_INVALID = 'Out of Range',
		ND_VALUE_INVALID = 'None';

	var UNIT_HR = 'hr',
		UNIT_MIN = 'min',
		UNIT_SEC = 'sec';

	var ID_SS = 0,
		ID_ND1 = 1,
		ID_SS_ND = 4;

	var MOVE_THRESHOLD = 15;

	var ANIMATE_DURATION_OPACITY = 200,
		ANIMATE_DURATION_MOVE = 100;

	var FONT_SIZE_HEADER = 6,
		FONT_SIZE_VALUE = 12,
		FONT_SIZE_ARROW = 10;

	var startX = null,
		startY = null,
		prevX = null,
		prevY = null,
		touching = false,
		moved = false,
		idValue = null,
		idLastSs = null;

	var indexSs = 15,     // 1/250sec, Math.round(SS_VALUES.length / 2),
		indexNd1 = 9,     // ND 200
		indexNd2 = 0,
		indexNd3 = 0,
		indexSsNd = 46;   // 5sec, Math.round(SS_VALUES.length / 2); //indexSs;

	var timerId = null;
	var time = 0;

	// initialize
	idLastSs = ID_SS;
	resetSsNd(0);
	resetSs(0);
	enableProgressBar('#SsProgressBar', true);
	enableProgressBar('#SsNdProgressBar', true);

	//
	// mouse events
	//
	$('#SsContainer').mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY, ID_SS);
	}).mousemove(function(event) {
		event.preventDefault();
		move(event.clientX, event.clientY);
	}).mouseup(function(event) {
		event.preventDefault();
		release(event.clientX, event.clientY);
	});

	$('#SsNdContainer').mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY, ID_SS_ND);
	}).mousemove(function(event) {
		event.preventDefault();
		move(event.clientX, event.clientY);
	}).mouseup(function(event) {
		event.preventDefault();
		release(event.clientX, event.clientY);
	});

	//
	// touch events
	//
	$('#SsContainer').bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, ID_SS);
	}).bind('touchmove', function(event) {
		event.preventDefault();
		move(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	}).bind('touchend', function(event) {
		event.preventDefault();
		release(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	}).bind('touchcancel', function(event) {
		event.preventDefault();
		release(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	});

	$('#SsNdContainer').bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, ID_SS_ND);
	}).bind('touchmove', function(event) {
		event.preventDefault();
		move(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	}).bind('touchend', function(event) {
		event.preventDefault();
		release(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	}).bind('touchcancel', function(event) {
		event.preventDefault();
		release(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
	});

	function touch(x, y, id) {
		startX = x;
		startY = y;
		prevX = x;
		prevY = y;
		touching = true;
		moved = false;
		idValue = id;
		if (id == ID_SS) {
            idLastSs = id;
            resetSs(0);
		} else if (id == ID_SS_ND) {
            idLastSs = id;
			resetSsNd(0);
		}
	}

	function move(x, y) {
		//console.log('move: x=' + x + ', y=' + y + ', idValue=' + idValue);
		if (!touching) return;
		var deltaX =  x - prevX;
		var deltaY =  y - prevY;
		var offset = 0;

		if (Math.abs(deltaX) > MOVE_THRESHOLD) {
			// move horizontal
			offset = deltaX > 0 ? 1 : -1;
			switch (idValue) {
			case ID_SS:
				resetSs(offset);
				break;
			case ID_SS_ND:
				resetSsNd(offset);
				break;
			default:
				break;
			}

			prevX = x;
			prevY = y;
			moved = true;
		} else if (Math.abs(deltaY) > MOVE_THRESHOLD) {
			// move vertical
			prevX = x;
			prevY = y;
			moved = true;
		}
	}

	function release(x, y) {
		if (!touching) return;
		cancel();
	}

	function cancel() {
		startX = null;
		startY = null;
		prevX = null;
		prevY = null;
		touching = false;
		moved = false;
		idValue = null;
	}

	function resetSs(offset) {
		indexSs += offset;
		if (indexSs < 0) {
			indexSs = 0;
		} else if (indexSs >= SS_VALUES.length) {
			indexSs = SS_VALUES.length - 1;
		}
		$('#SsValue').text(getTimeText(SS_VALUES[indexSs]));
		resetProgressBar('#SsProgressBar', indexSs + 1, SS_VALUES.length);
		resetNd();
	}

	function resetNd() {
		var nd = SS_VALUES[indexSsNd] / SS_VALUES[indexSs];
		$('#Nd1Value').text(nd);
		$('#OdStops1Value').text(getOdStopsText(nd));
	}

	function resetSsNd(offset) {
		indexSsNd += offset;
		if (indexSsNd < 0) {
			indexSsNd = 0;
		} else if (indexSsNd >= SS_VALUES.length) {
			indexSsNd = SS_VALUES.length - 1;
		}
		var sec = SS_VALUES[indexSsNd];
		$('#SsNdValue').text(getTimeText(sec));
		resetProgressBar('#SsNdProgressBar', indexSsNd + 1, SS_VALUES.length);
		resetNd();
	}

	function getTimeText(sec) {
		if (sec < 0.3) {
			sec = Math.round(1 / sec);
			return '1/' + sec + UNIT_SEC;
		} else if (sec >= 60 && sec < 3600) {
			var m = Math.floor(sec / 60);
			var s = Math.round(sec % 60);
			if (s == 0) {
				s = '';
			} else {
				s = ' ' + s + UNIT_SEC;
			}
			return m + UNIT_MIN + s;
		} else if (sec >= 3600) {
			var h = Math.floor(sec / 3600);
			var m = Math.floor((sec - 3600 * h) / 60);
			var s = Math.round(sec % 60);
			if (m == 0) {
				m = '';
			} else {
				m = ' ' + m + UNIT_MIN;
			}
			if (s == 0) {
				s = '';
			} else {
				s = ' ' + s + UNIT_SEC;
			}
			return h + UNIT_HR + m + s;
		}
		return sec.toFixed(1) + UNIT_SEC;
	}

	function getOdStopsText(nd) {
		return '' + Math.log10(nd).toFixed(1) + ' / ' + Math.log2(nd).toFixed(1) + ' Stops';
	}

	function resetProgressBar(id, progress, length) {
		var width = Math.round(($('#Container').width() / length) * progress);
		$(id + ' span').stop(true, true).animate({'width':width + 'px'}, ANIMATE_DURATION_MOVE, 'easeOutQuart');
	}

	function enableProgressBar(id, enebled) {
		$(id).stop(true, true).animate({'opacity':(enebled ? 1 : 0.2)}, ANIMATE_DURATION_OPACITY, 'linear');
	}

});
