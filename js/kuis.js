/* ===============================
   FIREBASE
=============================== */
const kuisRef = db.ref("kuis");

let kuisIdAktif = null;
let editSoalId = null;

/* ===============================
   LOAD SEMUA KUIS
=============================== */
function loadDaftarKuis() {

  const list = document.getElementById("listSoal");

  kuisRef.on("value", snapshot => {

    if (!list) return;

    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML =
        "<p class='text-muted'>Belum ada kuis</p>";
      return;
    }

    snapshot.forEach(item => {

      const k = item.val();
      const id = item.key;

      list.innerHTML += `
        <div class="card mb-2 shadow-sm">
          <div class="card-body">

            <h6 class="fw-bold">${k.judul}</h6>

            <button class="btn btn-sm btn-primary mt-2"
              onclick="pilihKuis('${id}')">
              📂 Kelola Soal
            </button>

          </div>
        </div>
      `;
    });

  });
}

/* ===============================
   PILIH KUIS
=============================== */
function pilihKuis(id){

  kuisIdAktif = id;
  editSoalId = null;

  alert("Kuis dipilih");

  loadSoal();
}

/* ===============================
   BUAT KUIS BARU
=============================== */
function simpanKuis(){

  const judul =
    document.getElementById("judul").value.trim();

  const durasi =
    document.getElementById("durasi").value;

  if(!judul){
    alert("Judul wajib diisi");
    return;
  }

  kuisRef.push({
    judul,
    durasi,
    dibuatOleh:"guru",
    createdAt:Date.now()
  }).then(ref=>{

    kuisIdAktif = ref.key;

    alert("Kuis dibuat");

    document.getElementById("judul").value="";
    document.getElementById("durasi").value="";

    loadSoal();
  });
}

/* ===============================
   TAMBAH / UPDATE SOAL
=============================== */
function tambahSoal(){

  if(!kuisIdAktif){
    alert("Pilih kuis dulu");
    return;
  }

  const pertanyaan =
    document.getElementById("pertanyaan").value.trim();

  const A = document.getElementById("opsiA").value.trim();
  const B = document.getElementById("opsiB").value.trim();
  const C = document.getElementById("opsiC").value.trim();
  const D = document.getElementById("opsiD").value.trim();

  const jawaban =
    document.getElementById("jawaban").value;

  if(!pertanyaan || !A || !B || !C || !D || !jawaban){
    alert("Semua field wajib diisi");
    return;
  }

  const dataSoal = {
    pertanyaan,
    opsi:{A,B,C,D},
    jawaban
  };

  const soalRef =
    kuisRef.child(kuisIdAktif).child("soal");

  // MODE EDIT
  if(editSoalId){

    soalRef.child(editSoalId)
      .update(dataSoal)
      .then(()=>{

        alert("Soal berhasil diupdate");

        resetForm();
        loadSoal();
      });

  }else{

    // MODE TAMBAH
    soalRef.push(dataSoal)
      .then(()=>{

        alert("Soal ditambahkan");

        resetForm();
        loadSoal();
      });
  }
}

/* ===============================
   LOAD SOAL
=============================== */
function loadSoal(){

  if(!kuisIdAktif) return;

  const list = document.getElementById("listSoal");

  kuisRef.child(kuisIdAktif)
    .child("soal")
    .on("value", snapshot => {

      list.innerHTML = "";

      if(!snapshot.exists()){
        list.innerHTML =
          "<p class='text-muted'>Belum ada soal</p>";
        return;
      }

      let no = 1;

      snapshot.forEach(item=>{

        const s  = item.val();
        const id = item.key;

        list.innerHTML += `
          <div class="card mb-3 shadow-sm">

            <div class="card-body">

              <!-- HEADER SOAL -->
              <button class="btn w-100 text-start fw-bold"
                data-bs-toggle="collapse"
                data-bs-target="#soal-${id}">
                ${no}. ${s.pertanyaan}
              </button>

              <!-- DETAIL SOAL -->
              <div class="collapse mt-3" id="soal-${id}">

                <div class="mb-2">
                  <strong>A.</strong> ${s.opsi.A}<br>
                  <strong>B.</strong> ${s.opsi.B}<br>
                  <strong>C.</strong> ${s.opsi.C}<br>
                  <strong>D.</strong> ${s.opsi.D}
                </div>

                <span class="badge bg-success">
                  Jawaban: ${s.jawaban}
                </span>

                <div class="mt-3 d-flex gap-2">

                  <button class="btn btn-warning btn-sm"
                    onclick="editSoal('${id}')">
                    ✏ Edit
                  </button>

                  <button class="btn btn-danger btn-sm"
                    onclick="hapusSoal('${id}')">
                    🗑 Hapus
                  </button>

                </div>

              </div>

            </div>
          </div>
        `;

        no++;
      });

    });
}

/* ===============================
   EDIT SOAL
=============================== */
function editSoal(id){

  kuisRef.child(kuisIdAktif)
    .child("soal")
    .child(id)
    .once("value")
    .then(snap=>{

      const s = snap.val();

      document.getElementById("pertanyaan").value =
        s.pertanyaan;

      document.getElementById("opsiA").value =
        s.opsi.A;

      document.getElementById("opsiB").value =
        s.opsi.B;

      document.getElementById("opsiC").value =
        s.opsi.C;

      document.getElementById("opsiD").value =
        s.opsi.D;

      document.getElementById("jawaban").value =
        s.jawaban;

      editSoalId = id;

      window.scrollTo({
        top:0,
        behavior:"smooth"
      });
    });
}

/* ===============================
   HAPUS SOAL
=============================== */
function hapusSoal(id){

  if(!confirm("Hapus soal ini?")) return;

  kuisRef.child(kuisIdAktif)
    .child("soal")
    .child(id)
    .remove();
}

/* ===============================
   RESET FORM
=============================== */
function resetForm(){

  ["pertanyaan","opsiA","opsiB","opsiC","opsiD","jawaban"]
    .forEach(id =>
      document.getElementById(id).value=""
    );

  editSoalId = null;
}

/* ===============================
   INIT
=============================== */
loadDaftarKuis();