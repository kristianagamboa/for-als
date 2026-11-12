/* Shared Stargazer lily artwork (injected as SVG symbols). Used by index.html and eula.html */
(function () {
  var A = [0, 60, 120, 180, 240, 300];
  var r = function (id, a) { return '<use href="#' + id + '" transform="rotate(' + a + ' 100 100)"/>'; };
  var bloom =
    [0, 120, 240, 60, 180, 300].map(function (a) { return r("tp", a); }).join("") +
    A.map(function (a) { return r("st", a); }).join("") +
    A.map(function (a) { return r("sp", a); }).join("") +
    [20, 80, 140, 200, 260, 320].map(function (a) { return r("sm", a); }).join("") +
    '<line x1="100" y1="100" x2="106" y2="58" stroke="#e59ab4" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="106" cy="56" r="3.6" fill="#d4608a"/><circle cx="100" cy="100" r="7" fill="#d5e6a6" fill-opacity=".85"/>';
  var leaf = "M0 0C14-11 42-15 66-9C44-1 20 6 0 0Z";
  var leaves = [[119, 385, -28, 1.3], [119, 352, -152, 1.3], [121, 308, -38, 1.15], [120, 268, -142, 1.15], [118, 226, -48, 1], [116, 196, -132, 1]]
    .map(function (l) { return '<path d="' + leaf + '" fill="#9db592" stroke="#86a07a" stroke-width=".6" transform="translate(' + l[0] + " " + l[1] + ") rotate(" + l[2] + ") scale(" + l[3] + ')"/>'; }).join("");
  var bud = "M0 0C-9-14-8-42 0-64C8-42 9-14 0 0Z";
  var plant =
    '<path d="M120 440C116 360 128 280 118 200C112 160 108 140 112 118" fill="none" stroke="#8fa886" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M121 262C140 250 160 226 172 196" fill="none" stroke="#8fa886" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M118 330C102 318 88 302 82 286" fill="none" stroke="#8fa886" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="' + bud + '" fill="url(#bg)" stroke="#d98aa2" stroke-width=".6" transform="translate(172 196) rotate(28)"/>' +
    '<path d="' + bud + '" fill="url(#bg)" stroke="#d98aa2" stroke-width=".6" transform="translate(82 288) rotate(-30) scale(.75)"/>' +
    leaves +
    '<g transform="translate(120 110) rotate(-10) scale(1 .82) translate(-120 -110)"><use href="#lily" x="10" y="0" width="220" height="220"/></g>';
  var svg =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<radialGradient id="pg" cx="50%" cy="92%" r="100%"><stop offset="0" stop-color="#b4446a"/><stop offset=".22" stop-color="#dd7a9b"/><stop offset=".58" stop-color="#f6c2d1"/><stop offset=".88" stop-color="#fde8ee"/><stop offset="1" stop-color="#fff8fa"/></radialGradient>' +
    '<linearGradient id="bg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b9cba7"/><stop offset=".45" stop-color="#f3cfda"/><stop offset="1" stop-color="#e9a3b9"/></linearGradient>' +
    '<path id="tp" d="M100 102C68 90 50 50 74 27C84 18 95 9 100 2C105 9 116 18 126 27C150 50 132 90 100 102Z" fill="url(#pg)" stroke="#d98aa2" stroke-opacity=".55" stroke-width=".7"/>' +
    '<path id="st" d="M100 98C96 72 97 42 100 12C103 42 104 72 100 98Z" fill="#c4527a" fill-opacity=".45"/>' +
    '<g id="sp" fill="#9a2f58" fill-opacity=".8"><circle cx="91" cy="80" r="1.5"/><circle cx="109" cy="76" r="1.4"/><circle cx="89" cy="62" r="1.5"/><circle cx="111" cy="58" r="1.4"/><circle cx="94" cy="46" r="1.3"/><circle cx="106" cy="40" r="1.2"/><circle cx="86" cy="88" r="1.2"/><circle cx="114" cy="88" r="1.2"/><circle cx="100" cy="66" r="1.3"/></g>' +
    '<g id="sm"><line x1="100" y1="100" x2="100" y2="66" stroke="#d9a2b0" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="100" cy="63" rx="3.2" ry="7.5" fill="#a9512c"/></g>' +
    '<symbol id="lily" viewBox="0 0 200 200">' + bloom + "</symbol>" +
    '<symbol id="lp" viewBox="0 0 240 440">' + plant + "</symbol>" +
    "</defs></svg>";
  document.body.insertAdjacentHTML("afterbegin", svg);
})();
