function drawProgressBar($element, percentage, backgroundColor, barColor) {
  var steps = 5;
  var loops = Math.round(100 / steps);
  var increment = 360 / loops;
  var half = Math.round(loops / 2);
  var currentStep = percentage / steps;
  var nextDeg, backgroundImage;

  if (currentStep < half) {
    nextDeg = 90 + (increment * currentStep);
    backgroundImage = 'linear-gradient(90deg, ' + backgroundColor + ' 50%, transparent 50%, transparent), linear-gradient(' + nextDeg + 'deg, ' + barColor +' 50%, ' + backgroundColor + ' 50%, ' + backgroundColor + ')';
  }
  else {
    nextDeg = -90 + (increment * (currentStep - half));
    backgroundImage = 'linear-gradient(' + nextDeg + 'deg, ' + barColor +' 50%, transparent 50%, transparent), linear-gradient(270deg, ' + barColor +' 50%, ' + backgroundColor + ' 50%, ' + backgroundColor + ')';
  }

  $element.css({
    'background-image': backgroundImage
  })
}