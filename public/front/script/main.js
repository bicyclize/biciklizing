/* Modernizr test for retina screens, adds retina/no-reina class to html */
Modernizr.addTest('retina', function () {
  return (window.devicePixelRatio > 1.5);
});

/* Modernizr test to detect android devices */
Modernizr.addTest('android', function(){
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("android") > -1;
});

/* Modernizr test to detect IE10 */
Modernizr.addTest('ie10', function() {
  return (!!document.documentMode && document.documentMode === 10);
});

/* Modernizr test to detect IE11 */
Modernizr.addTest('ie11', function() {
  return (!!document.documentMode && document.documentMode === 11);
});

/* Modernizr test to detect Safari 5 devices */
Modernizr.addTest('safari', function(){
  var ua = navigator.userAgent.toLowerCase();
  return (ua.indexOf("safari") > -1) && (ua.indexOf("chrome") <= -1);
});

/* Modernizr test to detect Safari 5 devices */
Modernizr.addTest('safari5', function(){
  var ua = navigator.userAgent.toLowerCase();
  var version = navigator.appVersion;
  return (ua.indexOf("safari") > -1) && (version.indexOf("Version/5") > -1 || version.indexOf("Version/4") > -1);
});

/* Modernizr test to detect iOS<6 devices */
Modernizr.addTest('iosold', function(){
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("iphone os 3") > -1 || ua.indexOf("cpu os 3") > -1
      || ua.indexOf("iphone os 4") > -1 || ua.indexOf("cpu os 4") > -1
      || ua.indexOf("iphone os 5") > -1 || ua.indexOf("cpu os 5") > -1;
});

/* Modernizr test for complex swipe methods: touch events and GPU accelerated CSS3 */
Modernizr.addTest('swipable', function () {
  return !Modernizr.android && Modernizr.touch && Modernizr.csstransitions && Modernizr.csstransforms && Modernizr.cssanimations;
});

/* Hide address bar in mobile */
if (Modernizr.touch) { /* Only in touch screens */
  window.addEventListener('load', function() {
    if (document.body.scrollTop === 0) {
      setTimeout(scrollTo, 0, 0, 1);
    }

  }, false);
}

window.historyNavigation = true;

/* App start */
$(document).ready(function() {
  /* Start FastClick plugin */
  FastClick.attach(document.body);

  /* Set debug mode from config vars */
  Hydra.setDebug(false);

  /* Start Browser modules */
  Hydra.module.start('Scroll', 'Scroll');
  Hydra.module.start('Prerender', 'Prerender');

  /* Start Views */
  Hydra.module.start('Superheader', 'Superheader');
  Hydra.module.start('Nav', 'Nav');
  Hydra.module.start('Page', 'Page');
  Hydra.module.start('Preorder', 'Preorder');

  /* Hash module */
  Hydra.module.start('Hash', 'Hash');

});
