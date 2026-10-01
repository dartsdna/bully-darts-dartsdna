(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbz46q3ht2jo9M36XOZCerX8odnTt1jLU6M657YjuJLafoJIXqYgrnbAf_N-ckI4fiBV/exec';

  function eventFor(name, params) {
    params = params || {};
    if (name === 'result_view') return { eventType: 'Result View', clickName: '' };
    if (name === 'dart_click') return { eventType: 'Dart Click', clickName: params.link_label || '' };
    if (name === 'quiz_start') return { eventType: 'Other Click', clickName: 'Start Quiz' };
    if (name === 'retake_quiz_click') return { eventType: 'Other Click', clickName: 'Retake Quiz' };
    return null;
  }

  window.trackDartsDnaEvent = function (name, params) {
    params = params || {};
    var event = eventFor(name, params);
    if (!event) return;
    var query = new URLSearchParams({
      site: 'bully',
      resultCode: params.result_slug || '',
      barrelProfile: params.barrel_profile || '',
      eventType: event.eventType,
      clickName: event.clickName
    });
    var beacon = new Image();
    beacon.src = ENDPOINT + '?' + query.toString();
  };
}());
