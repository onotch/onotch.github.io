'use strict';

const START_YEAR             = 2021;
const JOB_SCHEDULED_TIME_MIN = 40;
const GPV_UPDATE_MIN         = 30;

const GPV_URL = 'http://weather-gpv.info/';
const GPV_IMAGE_WIDTH  = 800;
const GPV_IMAGE_HEIGHT = 600;

const MONTH_NAME_ARRAY = new Array('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');

const QUERY_KEY_AREA  = 'area';
const QUERY_KEY_TYPE  = 'type';
const QUERY_KEY_YEAR  = 'y';
const QUERY_KEY_MONTH = 'm';
const QUERY_KEY_DAY   = 'd';
const QUERY_KEY_HOUR  = 'h';

const AUTO_PLAY_STATUS = {
	STOP : 0,
	PLAY : 1,
	REVERSE : 2
};

const ANIMATION_DURATION_MANUAL = 100;
const ANIMATION_DURATION_AUTO   = 200;

const TOUCH_MOVE_THRESHOLD       = 25;
const WHEEL_ACTION_DECIMATE_TIME = 75;

const KEY_CODE_LEFT  = 37;
const KEY_CODE_RIGHT = 39;

const ELEM_NAME_INPUT_AREA      = 'input[name=area]';
const ELEM_NAME_INPUT_TYPE      = 'input[name=type]';
const ELEM_NAME_SELECT_YEAR     = 'select[name=year]';
const ELEM_NAME_SELECT_MONTH    = 'select[name=month]';
const ELEM_NAME_SELECT_DAY      = 'select[name=day]';
const ELEM_NAME_SELECT_HOUR     = 'select[name=hour]';
const ELEM_NAME_INPUT_AUTO_PLAY = 'input[name=autoplay]';
const ELEM_NAME_SELECT_SPEED    = 'select[name=speed]';
const ELEM_NAME_OPTION          = '.Option';
const ELEM_NAME_PREV_BUTTON     = '#PrevButton';
const ELEM_NAME_NEXT_BUTTON     = '#NextButton';
const ELEM_NAME_RELOAD_BUTTON   = '#ReloadButton';
const ELEM_NAME_IMAGE           = '#Image';
const ELEM_NAME_GPV_IMAGE       = '#GpvImage';
const ELEM_NAME_GPV_FRAME       = '#GpvFrame > iframe';
const ELEM_NAME_TOUCH_AREA      = '#TouchArea';
const CLASS_NAME_PLAY           = 'Play';
const CLASS_NAME_PAUSE          = 'Pause';

var autoPlayTimer = null;
var autoPlayStatus = AUTO_PLAY_STATUS.STOP;

var touchStartX = null;
var touchStartY = null;
var touchPrevX = null;
var touchPrevY = null;
var isTouching = false;
var isTouchMoved = false;

var wheelLastActTime = new Date();

//
// functions
//
function prevHour() {
	if ($(ELEM_NAME_GPV_IMAGE + '> div').length > 1) {
		return;
	}

	var currentElement = $(ELEM_NAME_SELECT_HOUR + ' > option:selected');
	var newElement = currentElement.prev('option');
	if (newElement.length === 0) {
		if (prevDay()) {
			newElement = $(ELEM_NAME_SELECT_HOUR + ' > option').last();
		} else {
			return;
		}
	}
	$(ELEM_NAME_SELECT_HOUR).val(newElement.val());
	resetGpvImage();
	resetUrl();
}

function nextHour() {
	if ($(ELEM_NAME_GPV_IMAGE + '> div').length > 1) {
		return;
	}

	var currentElement = $(ELEM_NAME_SELECT_HOUR + ' > option:selected');
	var newElement = currentElement.next('option');
	if (newElement.length === 0) {
		if (nextDay()) {
			newElement = $(ELEM_NAME_SELECT_HOUR + ' > option').first();
		} else {
			return;
		}
	}
	$(ELEM_NAME_SELECT_HOUR).val(newElement.val());
	resetGpvImage();
	resetUrl();
}

function prevDay() {
	var currentElement = $(ELEM_NAME_SELECT_DAY + ' > option:selected');
	var newElement = currentElement.prev('option');
	if (newElement.length === 0) {
		if (prevMonth()) {
			newElement = $(ELEM_NAME_SELECT_DAY + ' > option').last();
		} else {
			return false;
		}
	}
	$(ELEM_NAME_SELECT_DAY).val(newElement.val());
	return true;
}

function nextDay() {
	var currentElement = $(ELEM_NAME_SELECT_DAY + ' > option:selected');
	var newElement = currentElement.next('option');
	if (newElement.length === 0) {
		if (nextMonth()) {
			newElement = $(ELEM_NAME_SELECT_DAY + ' > option').first();
		} else {
			return false;
		}
	}
	$(ELEM_NAME_SELECT_DAY).val(newElement.val());
	return true;
}

function prevMonth() {
	var currentElement = $(ELEM_NAME_SELECT_MONTH + ' > option:selected');
	var newElement = currentElement.prev('option');
	if (newElement.length === 0) {
		if (prevYear()) {
			newElement = $(ELEM_NAME_SELECT_MONTH + ' > option').last();
		} else {
			return false;
		}
	}
	$(ELEM_NAME_SELECT_MONTH).val(newElement.val());
	const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
	initDayOptions(year, newElement.val());
	return true;
}

function nextMonth() {
	var currentElement = $(ELEM_NAME_SELECT_MONTH + ' > option:selected');
	var newElement = currentElement.next('option');
	if (newElement.length === 0) {
		if (nextYear()) {
			newElement = $(ELEM_NAME_SELECT_MONTH + ' > option').first();
		} else {
			return false;
		}
	}
	$(ELEM_NAME_SELECT_MONTH).val(newElement.val());
	const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
	initDayOptions(year, newElement.val());
	return true;
}

function prevYear() {
	var currentElement = $(ELEM_NAME_SELECT_YEAR + ' > option:selected');
	var newElement = currentElement.prev('option');
	if (newElement.length === 0) {
		return false;
	}
	$(ELEM_NAME_SELECT_YEAR).val(newElement.val());
	return true;
}

function nextYear() {
	var currentElement = $(ELEM_NAME_SELECT_YEAR + ' > option:selected');
	var newElement = currentElement.next('option');
	if (newElement.length === 0) {
		return false;
	}
	$(ELEM_NAME_SELECT_YEAR).val(newElement.val());
	return true;
}

function initElementSize() {
	const width = window.innerWidth;
	const height = Math.round((width / GPV_IMAGE_WIDTH) * GPV_IMAGE_HEIGHT);
	//console.log('width=' + width + ', height=' + height);

	if (width >= GPV_IMAGE_WIDTH) {
		return;
	}

	$('body').css('width', width + 'px');
	$(ELEM_NAME_OPTION).css('width', width + 'px');
	$(ELEM_NAME_IMAGE).css({width: width + 'px', height: height + 'px'});
	$(ELEM_NAME_GPV_IMAGE).css({width: width + 'px', height: height + 'px'});
	$(ELEM_NAME_GPV_IMAGE + ' div').css({width: width + 'px', height: height + 'px'});
	$(ELEM_NAME_TOUCH_AREA).css({width: width + 'px', height: height + 'px'});
}

function initAreaAndTypeOptions() {
	const area = getParameterByName(QUERY_KEY_AREA);
	const type = getParameterByName(QUERY_KEY_TYPE);

	if (($.type(area) === 'string') && area.length > 0) {
		$(ELEM_NAME_INPUT_AREA).val([area]);
	}
	if (($.type(type) === 'string') && type.length > 0) {
		$(ELEM_NAME_INPUT_TYPE).val([type]);
	}
}

function initYearOptions() {
	const thisYear = (new Date()).getFullYear();
	for (var i = START_YEAR; i <= thisYear; i++) {
		$(ELEM_NAME_SELECT_YEAR).append('<option value="' + i + '">' + i + '</option>');
	}
}

function initDayOptions(year, month) {
	var lastDay = new Array('', 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
		lastDay[2] = 29;
	}

	var prevDay = null;
	if ($(ELEM_NAME_SELECT_DAY + ' > option').length > 0) {
		prevDay = $(ELEM_NAME_SELECT_DAY + ' > option:selected').val();
		$(ELEM_NAME_SELECT_DAY).empty();
	}

	for (var i = 1; i <= lastDay[month]; i++) {
		$(ELEM_NAME_SELECT_DAY).append('<option value="' + i + '">' + i + '</option>');
	}

	if (prevDay !== null) {
		if (prevDay > lastDay[month]) {
			prevDay = lastDay[month];
		}
		$(ELEM_NAME_SELECT_DAY).val(prevDay);
	}
}

function initDateSelect(year, month, day, hour) {
	var now = new Date();
	/*
	var hour_delta = now.getHours() % 3 + 1;
	if (hour_delta === 3 && now.getMinutes() >= JOB_SCHEDULED_TIME_MIN) {
		hour_delta = 0;
	}
	now.setHours(now.getHours() - hour_delta);
	*/
	if (!Number.isInteger(year))  year = now.getFullYear();
	if (!Number.isInteger(month)) month = now.getMonth() + 1;
	if (!Number.isInteger(day))   day = now.getDate();
	if (!Number.isInteger(hour))  hour = now.getHours();
	$(ELEM_NAME_SELECT_YEAR).val(year);
	$(ELEM_NAME_SELECT_MONTH).val(month);
	$(ELEM_NAME_SELECT_DAY).val(day);
	$(ELEM_NAME_SELECT_HOUR).val(hour);
}

function resetGpvImage() {
	if ($(ELEM_NAME_GPV_IMAGE + '> div').length > 1) {
		return;
	}

	const delay = autoPlayStatus === AUTO_PLAY_STATUS.STOP ? ANIMATION_DURATION_MANUAL : ANIMATION_DURATION_AUTO;

	$(ELEM_NAME_GPV_IMAGE).append('<div></div>');
	$(ELEM_NAME_GPV_IMAGE + '> div').last().css('animation-duration', delay + 'ms');
	$(ELEM_NAME_GPV_IMAGE + '> div').last().css('background-image', 'url(' + getGpvImagePath() + ')');
	$(ELEM_NAME_GPV_IMAGE + '> div').first().delay(delay).queue(function() {
		$(this).remove();
	})
}

function getGpvImagePath() {
	const now = new Date();
	const area = $(ELEM_NAME_INPUT_AREA + ':checked').val();
	const type = $(ELEM_NAME_INPUT_TYPE + ':checked').val();
	var year = $(ELEM_NAME_SELECT_YEAR).val();
	var month = $(ELEM_NAME_SELECT_MONTH).val();
	var day = $(ELEM_NAME_SELECT_DAY).val();
	var hour = $(ELEM_NAME_SELECT_HOUR).val();

	var selectedDate = new Date(year, (month - 1), day, hour, now.getMinutes(), now.getSeconds(), now.getMilliseconds());
	var hour_delta = Math.round(((selectedDate.getTime() - now.getTime()) / (1000 * 3600)));

	var path = '';
	if (hour_delta > -3) {
		var index = now.getHours() % 3;
		if (index === 2 && now.getMinutes() >= GPV_UPDATE_MIN) {
			index = -1;
		}
		index += hour_delta + 4;

		now.setHours(now.getHours() + hour_delta);
		year = now.getUTCFullYear();
		month = MONTH_NAME_ARRAY[now.getUTCMonth()];
		day = getDoubleDigits(now.getUTCDate());
		hour = getDoubleDigits(now.getUTCHours());

		path = GPV_URL + 'msm/msm_' + type + '_' + area + '_'
			+ index + '.' + hour + 'Z' + day + month + year + '.png';
	} else {
		month = getDoubleDigits(month);
		day = getDoubleDigits(day);
		hour = getDoubleDigits(hour);

		path = 'images/' + type + '/' + area + '/' + year + '/' + month + '/' + day + '/'
			+ 'msm_' + type + '_' + area + '_' + year + month + day + hour + '.png';
	}

	//console.log(path);
	return path;
}

function resetGpvFrame() {
	const area = $(ELEM_NAME_INPUT_AREA + ':checked').val();
	const type = $(ELEM_NAME_INPUT_TYPE + ':checked').val();

	var now = new Date();
	var hour_delta = now.getHours() % 3 + 3;
	if (hour_delta === 5 && now.getMinutes() >= GPV_UPDATE_MIN) {
		hour_delta = 2;
	}
	now.setHours(now.getHours() - hour_delta);
	const year = now.getFullYear();
	const month = getDoubleDigits(now.getMonth() + 1);
	const day = getDoubleDigits(now.getDate());
	const hour = getDoubleDigits(now.getHours());

	const url = GPV_URL + 'msm_' + type + '_' + area + '_' + year + month + day + hour + '.html';
	//console.log(url);

	$(ELEM_NAME_GPV_FRAME).attr('src', url);
}

function autoPlay() {
	const interval = $(ELEM_NAME_SELECT_SPEED + ' > option:selected').val();
	autoPlayTimer = setTimeout(function() {
		autoPlayStatus === AUTO_PLAY_STATUS.PLAY ? nextHour() : prevHour();
		autoPlay();
	}, interval);
}

function startAutoPlay(status) {
	clearTimeout(autoPlayTimer);
	autoPlay();
	switch (status) {
		case AUTO_PLAY_STATUS.PLAY:
			autoPlayStatus = status;
			$(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PAUSE);
			$(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PLAY);
			$(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PLAY);
			$(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PAUSE);
			break;
		case AUTO_PLAY_STATUS.REVERSE:
			autoPlayStatus = status;
			$(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PLAY);
			$(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PAUSE);
			$(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PAUSE);
			$(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PLAY);
			break;
		case AUTO_PLAY_STATUS.STOP:
			console.warn('status=' + status);
			stopAutoPlay();
			break;
		default:
			break;
	}
}

function stopAutoPlay() {
	autoPlayStatus = AUTO_PLAY_STATUS.STOP;
	clearTimeout(autoPlayTimer);
	$(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PAUSE);
	$(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PLAY);
	$(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PAUSE);
	$(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PLAY);
}

function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
	var results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function resetUrl() {
	const area = $(ELEM_NAME_INPUT_AREA + ':checked').val();
	const type = $(ELEM_NAME_INPUT_TYPE + ':checked').val();
	const year = $(ELEM_NAME_SELECT_YEAR).val();
	const month = $(ELEM_NAME_SELECT_MONTH).val();
	const day = $(ELEM_NAME_SELECT_DAY).val();
	const hour = $(ELEM_NAME_SELECT_HOUR).val();
	const url = getFileName() + '?' + QUERY_KEY_AREA + '=' + area + '&' + QUERY_KEY_TYPE + '=' + type + '&'
		+ QUERY_KEY_YEAR + '=' + year + '&' + QUERY_KEY_MONTH + '=' + month + '&'
		+ QUERY_KEY_DAY + '=' + day + '&' + QUERY_KEY_HOUR + '=' + hour;
	history.replaceState('', '', url);
}

function getFileName(url = window.location.href) {
	return url.split('/').pop().split('?').shift();
}

function getDoubleDigits(n) {
	return (n.toString().length === 1) ? ('0' + n) : n.toString();
}

function shouldActWheel() {
	if ((new Date()).getTime() - wheelLastActTime.getTime() > WHEEL_ACTION_DECIMATE_TIME) {
		wheelLastActTime = new Date();
		return true;
	}
	return false;
}

//
// on document load
//
$(document).ready(function() {

	//
	// initialize
	//
	initElementSize();
	initAreaAndTypeOptions();
	initYearOptions();
	initDayOptions((new Date()).getFullYear(), (new Date()).getMonth() + 1);
	initDateSelect(
		parseInt(getParameterByName(QUERY_KEY_YEAR)),
		parseInt(getParameterByName(QUERY_KEY_MONTH)),
		parseInt(getParameterByName(QUERY_KEY_DAY)),
		parseInt(getParameterByName(QUERY_KEY_HOUR)));
	resetGpvImage();
	//resetGpvFrame();
	resetUrl();

	//
	// mouse events
	//
	$(ELEM_NAME_TOUCH_AREA).mousedown(function(event) {
		event.preventDefault();
		touch(event.clientX, event.clientY);
	}).mousemove(function(event) {
		event.preventDefault();
		move(event.clientX, event.clientY);
	}).mouseup(function(event) {
		event.preventDefault();
		release(event.clientX, event.clientY);
	});

	$(ELEM_NAME_TOUCH_AREA).bind('wheel', function(event) {
		event.preventDefault();
		if (event.originalEvent.deltaY < 0 && shouldActWheel()) {
			prevHour();
		} else if (event.originalEvent.deltaY > 0 && shouldActWheel()) {
			nextHour();
		}
	});

	$(ELEM_NAME_SELECT_HOUR).bind('wheel', function(event) {
		event.preventDefault();
		//console.log('deltaY=' + event.originalEvent.deltaY);
		if (event.originalEvent.deltaY < 0 && shouldActWheel()) {
			prevHour();
		} else if (event.originalEvent.deltaY > 0 && shouldActWheel()) {
			nextHour();
		}
	});

	$(ELEM_NAME_SELECT_DAY).bind('wheel', function(event) {
		event.preventDefault();
		if (event.originalEvent.deltaY < 0 && shouldActWheel() && prevDay()) {
			resetGpvImage();
			resetUrl();
		} else if (event.originalEvent.deltaY > 0 && shouldActWheel() && nextDay()) {
			resetGpvImage();
			resetUrl();
		}
	});

	$(ELEM_NAME_SELECT_MONTH).bind('wheel', function(event) {
		event.preventDefault();
		if (event.originalEvent.deltaY < 0 && shouldActWheel() && prevMonth()) {
			resetGpvImage();
			resetUrl();
		} else if (event.originalEvent.deltaY > 0 && shouldActWheel() && nextMonth()) {
			resetGpvImage();
			resetUrl();
		}
	});

	$(ELEM_NAME_SELECT_YEAR).bind('wheel', function(event) {
		event.preventDefault();
		if (event.originalEvent.deltaY < 0 && shouldActWheel() && prevYear()) {
			resetGpvImage();
			resetUrl();
		} else if (event.originalEvent.deltaY > 0 && shouldActWheel() && nextYear()) {
			resetGpvImage();
			resetUrl();
		}
	});

	//
	// touch events
	//
	$(ELEM_NAME_TOUCH_AREA).bind('touchstart', function(event) {
		event.preventDefault();
		touch(event.originalEvent.changedTouches[0].clientX, event.originalEvent.changedTouches[0].clientY);
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

	function touch(x, y) {
		touchStartX = x;
		touchStartY = y;
		touchPrevX = x;
		touchPrevY = y;
		isTouching = true;
		isTouchMoved = false;
	}

	function move(x, y) {
		if (!isTouching) return;
		const deltaX =  x - touchPrevX;
		const deltaY =  y - touchPrevY;
		//console.log('move: x=' + x + ', y=' + y + ', deltaX=' + deltaX + ', deltaY=' + deltaY);

		if (Math.abs(deltaX) > TOUCH_MOVE_THRESHOLD) {
			// move horizontal
			if (autoPlayStatus !== AUTO_PLAY_STATUS.STOP) {
				stopAutoPlay();
			}
			if (deltaX < 0) {
				prevHour();
			} else {
				nextHour();
			}
			touchPrevX = x;
			touchPrevY = y;
			isTouchMoved = true;
		} else if (Math.abs(deltaY) > TOUCH_MOVE_THRESHOLD) {
			// move vertical
			touchPrevX = x;
			touchPrevY = y;
			isTouchMoved = true;
		}
	}

	function release(x, y) {
		if (!isTouching) return;
		cancel();
	}

	function cancel() {
		touchStartX = null;
		touchStartY = null;
		touchPrevX = null;
		touchPrevY = null;
		isTouching = false;
		isTouchMoved = false;
	}

	//
	// key events
	//
	$(this).keydown(function(event) {
		switch (event.keyCode) {
			case KEY_CODE_LEFT:
				if (autoPlayStatus !== AUTO_PLAY_STATUS.STOP) {
					stopAutoPlay();
				}
				prevHour();
				break;
			case KEY_CODE_RIGHT:
				if (autoPlayStatus !== AUTO_PLAY_STATUS.STOP) {
					stopAutoPlay();
				}
				nextHour();
				break;
			default:
				break;
		}
	});

	//
	// gui events
	//
	$(ELEM_NAME_INPUT_AREA).change(function() {
		stopAutoPlay();
		resetGpvImage();
		//resetGpvFrame();
		resetUrl();
	});

	$(ELEM_NAME_INPUT_TYPE).change(function() {
		stopAutoPlay();
		resetGpvImage();
		//resetGpvFrame();
		resetUrl();
	});

	$(ELEM_NAME_SELECT_YEAR).change(function() {
		stopAutoPlay();
		resetGpvImage();
		resetUrl();
	});

	$(ELEM_NAME_SELECT_MONTH).change(function() {
		stopAutoPlay();
		const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
		const month = $(ELEM_NAME_SELECT_MONTH + ' > option:selected').val()
		initDayOptions(year, month);
		resetGpvImage();
		resetUrl();
	});

	$(ELEM_NAME_SELECT_DAY).change(function() {
		stopAutoPlay();
		resetGpvImage();
		resetUrl();
	});

	$(ELEM_NAME_SELECT_HOUR).change(function() {
		stopAutoPlay();
		resetGpvImage();
		resetUrl();
	});

	$(ELEM_NAME_PREV_BUTTON).click(function() {
		if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
			switch (autoPlayStatus) {
				case AUTO_PLAY_STATUS.STOP:
				case AUTO_PLAY_STATUS.PLAY:
					startAutoPlay(AUTO_PLAY_STATUS.REVERSE);
					break;
				case AUTO_PLAY_STATUS.REVERSE:
					stopAutoPlay();
					break;
				default:
					console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
					break;
			}
		} else {
			prevHour();
		}
	});

	$(ELEM_NAME_NEXT_BUTTON).click(function() {
		if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
			switch (autoPlayStatus) {
				case AUTO_PLAY_STATUS.STOP:
				case AUTO_PLAY_STATUS.REVERSE:
					startAutoPlay(AUTO_PLAY_STATUS.PLAY);
					break;
				case AUTO_PLAY_STATUS.PLAY:
					stopAutoPlay();
					break;
				default:
					console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
					break;
			}
		} else {
			nextHour();
		}
	});

	$(ELEM_NAME_RELOAD_BUTTON).click(function() {
		const href = './' + getFileName() + '?'
			+ QUERY_KEY_AREA + '=' + $(ELEM_NAME_INPUT_AREA + ':checked').val() + '&'
			+ QUERY_KEY_TYPE + '=' + $(ELEM_NAME_INPUT_TYPE + ':checked').val();
		window.location.href = href;
	});

	$(ELEM_NAME_INPUT_AUTO_PLAY).change(function() {
		// $(ELEM_NAME_SELECT_SPEED).prop('disabled', !$(this).prop('checked'));
		stopAutoPlay();
	});

	$(ELEM_NAME_SELECT_SPEED).change(function() {
		//console.log($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked'));
		if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
			switch (autoPlayStatus) {
				case AUTO_PLAY_STATUS.PLAY:
				case AUTO_PLAY_STATUS.REVERSE:
					startAutoPlay(null);
				case AUTO_PLAY_STATUS.STOP:
					break;
				default:
					console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
					break;
			}
		} else {
			$(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked', true);
		}
	});

});
