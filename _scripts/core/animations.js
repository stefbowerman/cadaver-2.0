/**
 * Animation Helper Functions / constants
 * -----------------------------------------------------------------------------
 * A collection of functions that help with animations in javascript
 *
 */ 

// Match those set in variables.scss
export const transitionTimingDurations = {
  base:     300,
  fast:     150,
  fastest:  50,
  slow:     600,
  medium:   400,
  none:     0
};

export const transitionTimingFunctions = {
  base:      'ease-in-out',
  in:        'ease-out',
  out:       'ease-in',
  inOutUI:   'cubic-bezier(0.42, 0, 0.13, 1.04)'
};

// To add more see the full library - https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
export const easings = {
  // t: current time, b: begInnIng value, c: change In value, d: duration
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},  
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint(x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint(x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint(x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
}

/**
* Get one of the durations stored in the variable defined above
* If the requested duration doesn't exist, fallback to the base
*
* @param {string} key - string matching one of the key names
* @return {int} - duration in ms
*/
export function getTransitionTimingDuration(key) {
  let k = 'base';

  if (transitionTimingDurations.hasOwnProperty(key)) {
    k = key;
  }
  
  return transitionTimingDurations[k];
}

/**
* Get one of the timing functions stored in the variable defined above
* If the requested function doesn't exist, fallback to the base
*
* @param {string} key - string matching one of the key names
* @return {string} - valid css timing function
*/
export function getTransitionTimingFunction(key) {
  let k = 'base';

  if (transitionTimingFunctions.hasOwnProperty(key)) {
    k = key;
  }

  return transitionTimingFunctions[k];
}

export function initialize() {
  $.extend($.easing, easings); // Add some extra easing equations
}