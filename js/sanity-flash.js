/* Flash content from Sanity.
   Shared by flash.html (the grid) and flash-booking.html (a single flash).
   Saveria edits the flashes in the Sanity panel; this file reads them. */
(function () {
  const PROJECT_ID = "hwij696s";
  const DATASET = "production";
  const API = "https://" + PROJECT_ID + ".apicdn.sanity.io/v2024-01-01/data/query/" + DATASET;

  // the fields every flash needs; "image" is the public CDN address of the picture
  const FIELDS =
    '{ "id": _id, title, priceSmall, priceMedium, priceLarge, taken, "image": image.asset->url }';

  function query(groq, params) {
    let url = API + "?query=" + encodeURIComponent(groq);
    Object.keys(params || {}).forEach(function (key) {
      url += "&$" + key + "=" + encodeURIComponent(JSON.stringify(params[key]));
    });
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Sanity request failed: " + r.status);
        return r.json();
      })
      .then(function (data) {
        return data.result;
      });
  }

  // resized, modern-format version of a Sanity image (keeps the page light)
  function sized(url, width) {
    return url ? url + "?w=" + width + "&auto=format" : "";
  }

  // Old links look like ?flash=07: map them to the id Sanity uses (flash-07).
  function idFromParam(value) {
    const raw = (value || "").trim();
    return /^\d{1,2}$/.test(raw) ? "flash-" + raw.padStart(2, "0") : raw;
  }

  // "Non disponibile" for any size left empty in the panel; the 4th size is always "Da concordare"
  function priceList(flash) {
    const none = "Non disponibile";
    return [
      flash.priceSmall || none,
      flash.priceMedium || none,
      flash.priceLarge || none,
      "Da concordare",
    ].join("|");
  }

  // a flash is taken when Saveria switched it off, or when every size is unavailable
  function isTaken(flash) {
    return !!flash.taken || (!flash.priceSmall && !flash.priceMedium && !flash.priceLarge);
  }

  window.SaveFlash = {
    list: function () {
      return query('*[_type == "flash"] | order(_createdAt desc) ' + FIELDS);
    },
    get: function (id) {
      return query('*[_type == "flash" && _id == $id][0] ' + FIELDS, { id: id });
    },
    sized: sized,
    idFromParam: idFromParam,
    priceList: priceList,
    isTaken: isTaken,
  };

  /* ---------------- flash.html: draw the grid ---------------- */
  const grid = document.getElementById("flash-grid");
  if (!grid) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function card(flash) {
    const taken = isTaken(flash);
    const href = "flash-booking.html?flash=" + encodeURIComponent(flash.id);

    const li = el("li", "flash-card" + (taken ? " flash-card--taken" : ""));

    const media = el("div", "flash-card__media");
    const link = el("a", "flash-card__link");
    link.href = href;
    link.tabIndex = -1;
    const img = el("img");
    img.src = sized(flash.image, 800);
    img.alt = "Disegno flash " + flash.title;
    img.loading = "lazy";
    link.appendChild(img);
    media.appendChild(link);

    const foot = el("div", "flash-card__foot");
    const status = el(
      "span",
      "flash-card__status flash-card__status--" + (taken ? "taken" : "available"),
      taken ? "Non disponibile" : "Disponibile"
    );
    foot.appendChild(status);
    if (!taken) {
      const cta = el("a", "flash-card__cta", "Lo voglio ");
      cta.href = href;
      const arrow = el("span", "", "↗");
      arrow.setAttribute("aria-hidden", "true");
      cta.appendChild(arrow);
      foot.appendChild(cta);
    }

    li.appendChild(media);
    li.appendChild(el("p", "flash-card__title", flash.title));
    li.appendChild(foot);
    return li;
  }

  grid.setAttribute("aria-busy", "true");
  window.SaveFlash.list()
    .then(function (flashes) {
      grid.textContent = "";
      flashes.forEach(function (flash) {
        grid.appendChild(card(flash));
      });
      grid.removeAttribute("aria-busy");
    })
    .catch(function () {
      grid.textContent = "";
      grid.appendChild(
        el("li", "flash-card__title", "Non riesco a caricare i flash in questo momento. Riprova tra poco.")
      );
      grid.removeAttribute("aria-busy");
    });
})();
