/* ===============================
   FIREBASE REF & STATE
=============================== */
const materiRef = db.ref("materi");
let editMateriId = null;
let currentUserRole = null;

/* ===============================
   CEK AUTH & ROLE
=============================== */
firebase.auth().onAuthStateChanged(user => {
  if (!user) return;

  db.ref("users").child(user.uid).once("value")
    .then(snapshot => {
      const userData = snapshot.val();
      if (!userData || !userData.role) return;

      currentUserRole =
        userData.role.toLowerCase().trim();

      tampilkanMateri();
    });
});

/* ===============================
   KOMPRES GAMBAR
=============================== */
function compressImage(file, callback) {

  const reader = new FileReader();

  reader.onload = e => {

    const img = new Image();

    img.onload = () => {

      const canvas =
        document.createElement("canvas");

      const MAX_WIDTH = 1280;

      const scale =
        img.width > MAX_WIDTH
          ? MAX_WIDTH / img.width
          : 1;

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      callback(
        canvas.toDataURL("image/jpeg", 0.7)
      );
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

/* ===============================
   TAMBAH / UPDATE MATERI
=============================== */
function tambahMateri() {

  const judul =
    document.getElementById("judul")
      .value.trim();

  const deskripsi =
    document.getElementById("deskripsi")
      .value.trim();

  const konten =
    document.getElementById("konten")
      .innerHTML.trim();

  const youtubeUrl =
    document.getElementById("youtubeUrl")
      .value.trim();

  const file =
    document.getElementById("gambar")
      .files[0];

  if (!judul || !konten) {
    alert("Judul dan konten wajib diisi!");
    return;
  }

  if (file) {
    compressImage(file,
      base64 => simpanData(base64)
    );
  } else {
    simpanData("");
  }

  function simpanData(imageBase64) {

    const data = {
      judul,
      deskripsi,
      konten,
      youtubeUrl,
      imageBase64,
      updatedAt: Date.now()
    };

    if (editMateriId) {

      materiRef
        .child(editMateriId)
        .update(data)
        .then(() => {
          alert("Materi diperbarui");
          resetForm();
        });

    } else {

      materiRef
        .push({
          ...data,
          createdAt: Date.now()
        })
        .then(() => {
          alert("Materi disimpan");
          resetForm();
        });
    }
  }
}

/* ===============================
   TAMPILKAN MATERI
=============================== */
function tampilkanMateri() {

  materiRef.on("value", snapshot => {

    const list =
      document.getElementById("listMateri");

    if (!list) return;

    list.innerHTML = "";

    snapshot.forEach(item => {

      const m = item.val();
      const id = item.key;
      const videoId =
        getYoutubeId(m.youtubeUrl);

      list.innerHTML += `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex flex-column">

              <h5 class="fw-bold">${m.judul}</h5>

              <p class="text-muted small">
                ${m.deskripsi || ""}
              </p>

              <button class="btn btn-primary mt-auto"
                      data-bs-toggle="collapse"
                      data-bs-target="#materi-${id}">
                📖 Buka Materi
              </button>

              <div class="collapse mt-3 materi-collapse shadow-sm"
                <hr>

                ${
                  m.imageBase64
                    ? `
                    <img src="${m.imageBase64}"
                         class="img-fluid rounded mb-2">
                  `
                    : ""
                }

                <div>
                  ${m.konten}
                </div>

                ${
                  videoId
                    ? `
                    <div class="ratio ratio-16x9 mt-2">
                      <iframe
                        src="https://www.youtube.com/embed/${videoId}"
                        allowfullscreen>
                      </iframe>
                    </div>
                  `
                    : ""
                }

                ${
                  currentUserRole === "guru"
                    ? `
                    <div class="d-flex justify-content-center gap-2 mt-3">
                      <button class="btn btn-warning btn-sm"
                        onclick="editMateri('${id}')">
                        ✏️ Edit
                      </button>
                      <button class="btn btn-danger btn-sm"
                        onclick="hapusMateri('${id}')">
                        🗑️ Hapus
                      </button>
                    </div>
                  `
                    : ""
                }

              </div>

            </div>
          </div>
        </div>
      `;
    });

  });
}

/* ===============================
   EDIT
=============================== */
function editMateri(id) {

  materiRef.child(id)
    .once("value")
    .then(snap => {

      const m = snap.val();
      if (!m) return;

      document.getElementById("judul")
        .value = m.judul || "";

      document.getElementById("deskripsi")
        .value = m.deskripsi || "";

      document.getElementById("konten")
        .innerHTML = m.konten || "";

      document.getElementById("youtubeUrl")
        .value = m.youtubeUrl || "";

      editMateriId = id;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
}

/* ===============================
   HAPUS
=============================== */
function hapusMateri(id) {

  if (!confirm("Yakin hapus materi?"))
    return;

  materiRef.child(id).remove();
}

/* ===============================
   RESET FORM
=============================== */
function resetForm() {

  document.getElementById("judul").value = "";
  document.getElementById("deskripsi").value = "";
  document.getElementById("youtubeUrl").value = "";
  document.getElementById("gambar").value = "";

  document.getElementById("konten")
    .innerHTML = "";

  editMateriId = null;
}

/* ===============================
   YOUTUBE ID
=============================== */
function getYoutubeId(url) {

  if (!url) return null;

  const match =
    url.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/
    );

  return match ? match[1] : null;
}

/* ===============================
   FORMAT TOOLBAR
=============================== */
function format(cmd, value = null) {
  document.execCommand(cmd, false, value);

}
