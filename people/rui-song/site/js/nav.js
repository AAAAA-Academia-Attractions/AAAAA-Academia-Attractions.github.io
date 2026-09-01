(function () {
  var body = document.querySelector(".rs-body");
  var button = document.querySelector("[data-rs-menu]");
  var nav = document.getElementById("rs-nav");
  if (body && button && nav) {
    button.addEventListener("click", function () {
      var open = !body.classList.contains("is-open");
      body.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var box = document.querySelector("[data-rs-news]");
  if (!box) return;

  var dragging = false;
  var armed = false;
  var startY = 0;
  var startScroll = 0;

  box.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch") return;
    if (event.button !== 0) return;
    if (event.target.closest("p, a")) return;
    armed = true;
    dragging = false;
    startY = event.clientY;
    startScroll = box.scrollTop;
  });

  box.addEventListener("pointermove", function (event) {
    if (!armed) return;
    if (!dragging) {
      if (Math.abs(event.clientY - startY) < 6) return;
      dragging = true;
      box.classList.add("is-dragging");
      box.setPointerCapture(event.pointerId);
    }
    box.scrollTop = startScroll - (event.clientY - startY);
  });

  function stopDrag() {
    armed = false;
    dragging = false;
    box.classList.remove("is-dragging");
  }

  box.addEventListener("pointerup", stopDrag);
  box.addEventListener("pointercancel", stopDrag);
})();
