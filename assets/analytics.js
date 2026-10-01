(function () {
  var GOOGLE_SHEET_EVENT_ENDPOINT = "https://script.google.com/macros/s/AKfycbxI1NIeCj3S2nK3__hqpKFawvS19Psh6GHjM04Uky_bKfrGYNrsSFDgGn29I3q4LWyb/exec";

  function readResultId() {
    var match = window.location.pathname.match(/\/results\/([^/]+)\//);
    return match ? match[1] : "";
  }

  function readBarrelProfile() {
    var lines = document.querySelectorAll(".profile-line");
    for (var i = 0; i < lines.length; i += 1) {
      var text = (lines[i].textContent || "").trim();
      if (/best barrel profile/i.test(text)) return text.replace(/best barrel profile:\s*/i, "").trim();
    }
    return "";
  }

  function cleanLabel(value) {
    return (value || "").replace(/^View\s+/i, "").replace(/\s+recommendation$/i, "").trim();
  }

  function makeSheetEvent(name, params) {
    params = params || {};
    var resultCode = params.result_slug || readResultId();
    var barrelProfile = params.barrel_profile || readBarrelProfile();
    if (name === "result_view") return { resultCode: resultCode, barrelProfile: barrelProfile, eventType: "Result View", clickName: "" };
    if (name === "dart_click") return { resultCode: resultCode, barrelProfile: barrelProfile, eventType: "Dart Click", clickName: cleanLabel(params.link_label) };
    var clicks = { quiz_start: "Start Quiz", retake_quiz_click: "Retake Quiz", book_lane_click: "Book a lane", partner_button_click: "Book a lane" };
    return clicks[name] ? { resultCode: resultCode, barrelProfile: barrelProfile, eventType: "Other Click", clickName: clicks[name] } : null;
  }

  function sendToGoogleSheet(name, params) {
    if (!GOOGLE_SHEET_EVENT_ENDPOINT) return;
    var event = makeSheetEvent(name, params);
    if (!event) return;
    event.site = "as.dartsdna.app";
    var body = JSON.stringify(event);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(GOOGLE_SHEET_EVENT_ENDPOINT, new Blob([body], { type: "text/plain;charset=utf-8" }));
      return;
    }
    fetch(GOOGLE_SHEET_EVENT_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, keepalive: true }).catch(function () {});
  }

  window.trackDartsDnaEvent = function (name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    sendToGoogleSheet(name, params || {});
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-analytics="retake_quiz_click"]').forEach(function (link) {
      link.href = "https://aimstraightdarts.com.au/pages/find-your-perfect-dart";
      link.target = "_top";
    });
    var resultCode = readResultId();
    if (resultCode) window.trackDartsDnaEvent("result_view", { result_slug: resultCode, barrel_profile: readBarrelProfile() });
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-analytics]");
      if (!target) return;
      window.trackDartsDnaEvent(target.dataset.analytics, { result_slug: target.dataset.resultSlug, barrel_profile: target.dataset.barrelProfile, link_label: target.getAttribute("aria-label") || "" });
    });
  });
})();
