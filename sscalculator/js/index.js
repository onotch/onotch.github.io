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
		ID_ND2 = 2,
		ID_ND3 = 3,
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
	resetNd1(0);
	resetNd2(0);
	resetNd3(0);
	enableProgressBar('#SsNdProgressBar', false);
	resetArrowIcon(idLastSs);

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
//	}).mousewheel(function(event, delta, deltaX, deltaY) {
//		// TODO
	});

	$('#Nd1Container').mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY, ID_ND1);
	}).mousemove(function(event) {
		event.preventDefault();
		move(event.clientX, event.clientY);
	}).mouseup(function(event) {
		event.preventDefault();
		release(event.clientX, event.clientY);
	});

	$('#Nd2Container').mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY, ID_ND2);
	}).mousemove(function(event) {
		event.preventDefault();
		move(event.clientX, event.clientY);
	}).mouseup(function(event) {
		event.preventDefault();
		release(event.clientX, event.clientY);
	});

	$('#Nd3Container').mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY, ID_ND3);
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

	$('#ArrowIcon span').mousedown(function(event) {
		event.preventDefault();
		var id = (idLastSs == ID_SS) ? ID_SS_ND : ID_SS;
		touch(event.clientX, event.clientY, id);
		release(event.clientX, event.clientY);
	});

	$('#StartTimer').mousedown(function(event) {
		event.preventDefault();
		startTimer();
	});

	$('#StartPauseTimer').mousedown(function(event) {
		event.preventDefault();
		startPauseTimer();
	});

	$('#StopTimer').mousedown(function(event) {
		event.preventDefault();
		closeTimer();
	});

	$('.GlyphIconRestart').mousedown(function(event) {
		event.preventDefault();
		startTimer();
	});

	$('.GlyphIconClose').mousedown(function(event) {
		event.preventDefault();
		closeTimer();
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

	$('#Nd1Container').bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, ID_ND1);
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

	$('#Nd2Container').bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, ID_ND2);
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

	$('#Nd3Container').bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, ID_ND3);
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

	$('#ArrowIcon span').bind('touchstart', function(event) {
		event.preventDefault();
		var id = (idLastSs == ID_SS) ? ID_SS_ND : ID_SS;
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY, id);
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
            resetArrowIcon(id);
            resetSs(0);
			enableProgressBar('#SsProgressBar', true);
			enableProgressBar('#SsNdProgressBar', false);
		} else if (id == ID_SS_ND) {
            idLastSs = id;
            resetArrowIcon(id);
			resetSsNd(0);
            enableProgressBar('#SsProgressBar', false);
			enableProgressBar('#SsNdProgressBar', true);
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
			case ID_ND1:
				resetNd1(offset);
				break;
			case ID_ND2:
				resetNd2(offset);
				break;
			case ID_ND3:
				resetNd3(offset);
				break;
			case ID_SS_ND:
				resetSsNd(offset);
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
		resetSsNdValue(SS_VALUES[indexSs], ND_VALUES[indexNd1], ND_VALUES[indexNd2], ND_VALUES[indexNd3]);
	}

	function resetNd1(offset) {
		indexNd1 += offset;
		if (indexNd1 < 0) {
			indexNd1 = 0;
		} else if (indexNd1 >= ND_VALUES.length) {
			indexNd1 = ND_VALUES.length - 1;
		}
		resetProgressBar('#Nd1ProgressBar', indexNd1 + 1, ND_VALUES.length);
		$('#Nd1Value').text(indexNd1 == 0 ? ND_VALUE_INVALID : ND_VALUES[indexNd1]);
		$('#OdStops1Value').text(getOdStopsText(indexNd1));
		resetSsOrSsNdValue();
	}

	function resetNd2(offset) {
		indexNd2 += offset;
		if (indexNd2 < 0) {
			indexNd2 = 0;
		} else if (indexNd2 >= ND_VALUES.length) {
			indexNd2 = ND_VALUES.length - 1;
		}
		resetProgressBar('#Nd2ProgressBar', indexNd2 + 1, ND_VALUES.length);
		$('#Nd2Value').text(indexNd2 == 0 ? ND_VALUE_INVALID : ND_VALUES[indexNd2]);
		$('#OdStops2Value').text(getOdStopsText(indexNd2));
		resetSsOrSsNdValue();
	}

	function resetNd3(offset) {
		indexNd3 += offset;
		if (indexNd3 < 0) {
			indexNd3 = 0;
		} else if (indexNd3 >= ND_VALUES.length) {
			indexNd3 = ND_VALUES.length - 1;
		}
		resetProgressBar('#Nd3ProgressBar', indexNd3 + 1, ND_VALUES.length);
		$('#Nd3Value').text(indexNd3 == 0 ? ND_VALUE_INVALID : ND_VALUES[indexNd3]);
		$('#OdStops3Value').text(getOdStopsText(indexNd3));
		resetSsOrSsNdValue();
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
		resetSsValue(SS_VALUES[indexSsNd], ND_VALUES[indexNd1], ND_VALUES[indexNd2], ND_VALUES[indexNd3]);
		enableStartTimerIcon(sec >= 1 && sec <= Number.MAX_SAFE_INTEGER);
	}

	function resetSsOrSsNdValue() {
		switch (idLastSs) {
		case ID_SS:
			resetSsNdValue(SS_VALUES[indexSs], ND_VALUES[indexNd1], ND_VALUES[indexNd2], ND_VALUES[indexNd3]);
			break;
		case ID_SS_ND:
			resetSsValue(SS_VALUES[indexSsNd], ND_VALUES[indexNd1], ND_VALUES[indexNd2], ND_VALUES[indexNd3]);
			break;
		}
	}

	function resetSsNdValue(ss, nd1, nd2, nd3) {
		var sec = ss * nd1 * nd2 * nd3;
		if (sec >= 0 && sec <= Number.MAX_SAFE_INTEGER) {
			$('#SsNdValue').text(getTimeText(sec));
		} else {
			$('#SsNdValue').text(SS_VALUE_INVALID);
		}
		enableStartTimerIcon(sec >= 1 && sec <= Number.MAX_SAFE_INTEGER);
	}

	function resetSsValue(ssnd, nd1, nd2, nd3) {
		var sec = nd1 * nd2 * nd3;
		if (sec > 0 && sec <= Number.MAX_SAFE_INTEGER) {
			$('#SsValue').text(getTimeText(ssnd / sec));
		} else {
			$('#SsValue').text(SS_VALUE_INVALID);
		}
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

	function getTimerText(sec) {
		var h = Math.floor(sec / 3600);
		if (h < 1) {
			h = 0;
		}
		var m = Math.floor((sec - 3600 * h) / 60);
		var s = Math.round(sec % 60);
		return '' + h + ' : ' + zeroPadding(m, 2) + ' : ' + zeroPadding(s, 2);
	}

	function zeroPadding(num, len){
		return (Array(len).join('0') + num).slice(-len);
	}

	function getOdStopsText(indexNd) {
		return '' + Math.log10(ND_VALUES[indexNd]).toFixed(1) + ' / ' + Math.log2(ND_VALUES[indexNd]).toFixed(1) + ' Stops';
	}

	function resetArrowIcon(id) {
		switch (id) {
		case ID_SS:
//			$('#ArrowIcon span').removeClass('GlyphIconCircleArrowUp');
//			$('#ArrowIcon span').addClass('GlyphIconCircleArrowDown');
			$('#ArrowIcon span').removeClass('RotateDown');
			$('#ArrowIcon span').addClass('RotateUp');
			break;
		case ID_SS_ND:
//			$('#ArrowIcon span').removeClass('GlyphIconCircleArrowDown');
//			$('#ArrowIcon span').addClass('GlyphIconCircleArrowUp');
			$('#ArrowIcon span').removeClass('RotateUp');
			$('#ArrowIcon span').addClass('RotateDown');
			break;
		}
	}

	function resetProgressBar(id, progress, length) {
		var width = Math.round(($('#Container').width() / length) * progress);
		$(id + ' span').stop(true, true).animate({'width':width + 'px'}, ANIMATE_DURATION_MOVE, 'easeOutQuart');
	}

	function enableProgressBar(id, enebled) {
		$(id).stop(true, true).animate({'opacity':(enebled ? 1 : 0.2)}, ANIMATE_DURATION_OPACITY, 'linear');
	}

	function enableStartTimerIcon(enebled) {
		$('#StartTimer').stop(true, true).animate({'opacity':(enebled ? 1 : 0.4)}, ANIMATE_DURATION_OPACITY, 'linear');
	}

	function startTimer() {
		switch (idLastSs) {
			case ID_SS:
				time = SS_VALUES[indexSs] * ND_VALUES[indexNd1] * ND_VALUES[indexNd2] * ND_VALUES[indexNd3];
				break;
			case ID_SS_ND:
				time = SS_VALUES[indexSsNd];
				break;
		}

		time = Math.round(time) - 1;

		if (time >= 0 && time <= Number.MAX_SAFE_INTEGER) {
			$('#TimeValue').text(getTimerText(time));
			$('#Finished').hide();
			$('#Timer').show();
			$('#TimerContainer').css('display', 'flex')
				.stop(true, true).animate({'opacity':1}, ANIMATE_DURATION_OPACITY, 'linear');
			clearTimer();
			startPauseTimer();
		}
	}

	function startPauseTimer() {
		if (timerId === null) {
			timerId = setInterval(updateTimer, 1000);
			$('#TimeValue').removeClass('BlinkFast');
			$('#StartPauseTimer').removeClass('GlyphIconStart');
			$('#StartPauseTimer').addClass('GlyphIconPause');
		} else {
			clearTimer();
			$('#TimeValue').addClass('BlinkFast');
			$('#StartPauseTimer').removeClass('GlyphIconPause');
			$('#StartPauseTimer').addClass('GlyphIconStart');
		}
	}

	function closeTimer() {
		time = 0;
		clearTimer();
		$('#TimerContainer').stop(true, true).fadeOut(ANIMATE_DURATION_OPACITY);
	}

	function updateTimer() {
		if (time >= 1) {
			$('#TimeValue').text(getTimerText(--time));
		} else {
			clearTimer();
			$('#Timer').hide();
			$('#Finished').show();
		}
	}

	function clearTimer() {
		clearInterval(timerId);
		timerId = null;
	}

});
