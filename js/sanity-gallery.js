/* Photos added from the Sanity panel.
   The photos already in the HTML stay where they are: this file only ADDS the new ones that
   Saveria uploads. A gallery asks for its photos with a data attribute, for example:
     data-sanity-photos="tattooPhoto"                      (all tattoo photos)
     data-sanity-photos="piercingPhoto:zone:naso"          (type : field : value)
   Newest photos go first, like the existing galleries. Add data-sanity-position="end" for a
   gallery that is in chronological order (new photos at the end, e.g. dermopigmentation). */
(function () {
  const PROJECT_ID = "hwij696s";
  const DATASET = "production";
  const API = "https://" + PROJECT_ID + ".apicdn.sanity.io/v2024-01-01/data/query/" + DATASET;
  const WIDTH = 600; // the width the photos are asked for, like the existing ones

  const containers = [...document.querySelectorAll("[data-sanity-photos]")];
  if (!containers.length) return;

  function fetchPhotos(spec) {
    const parts = spec.split(":"); // type[:field:value]
    const type = parts[0];
    const field = parts[1];
    const filter = field ? " && " + field + " == $value" : "";
    const groq =
      '*[_type == $type' + filter + '] | order(_createdAt desc) { alt, "url": image.asset->url, ' +
      '"w": image.asset->metadata.dimensions.width, "h": image.asset->metadata.dimensions.height }';

    let url = API + "?query=" + encodeURIComponent(groq) + "&$type=" + encodeURIComponent(JSON.stringify(type));
    if (field) url += "&$value=" + encodeURIComponent(JSON.stringify(parts[2]));

    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Sanity request failed: " + r.status);
        return r.json();
      })
      .then(function (data) {
        return (data.result || []).filter(function (p) {
          return p.url;
        });
      });
  }

  function item(photo, isStrip) {
    const li = document.createElement("li");
    li.className = isStrip ? "zone__thumb" : "tattoo-gallery__item";
    const img = document.createElement("img");
    img.src = photo.url + "?w=" + WIDTH + "&auto=format";
    img.alt = photo.alt || "";
    img.loading = "lazy";
    if (!isStrip && photo.w && photo.h) {
      // the masonry reads the shape from these attributes, so nothing jumps while loading
      img.width = WIDTH;
      img.height = Math.round((WIDTH * photo.h) / photo.w);
    }
    li.appendChild(img);
    return li;
  }

  containers.forEach(function (container) {
    const isStrip = container.classList.contains("zone__strip");
    const atEnd = container.dataset.sanityPosition === "end";

    fetchPhotos(container.dataset.sanityPhotos)
      .then(function (photos) {
        if (!photos.length) return;
        const fragment = document.createDocumentFragment();
        // photos come newest first; a chronological gallery wants the oldest of the new ones first
        (atEnd ? photos.slice().reverse() : photos).forEach(function (photo) {
          fragment.appendChild(item(photo, isStrip));
        });
        if (atEnd) container.appendChild(fragment);
        else container.insertBefore(fragment, container.firstChild);

        // tell the masonry and the strip arrows that the gallery changed
        container.dispatchEvent(new Event("gallery:relayout"));
        window.dispatchEvent(new Event("resize"));
      })
      .catch(function () {
        // if Sanity does not answer, the photos already in the page are still there
      });
  });
})();
