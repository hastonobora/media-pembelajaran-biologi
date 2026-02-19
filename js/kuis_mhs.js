/*************************************************
 * KUIS MAHASISWA - FINAL PRO
 *************************************************/

const kuisRef = db.ref("kuis");
const nilaiRef = db.ref("nilai");

const listKuis = document.getElementById("listKuis");
const quizArea = document.getElementById("quizArea");

let soalList = [];
let indexSoal = 0;
let skor = 0;
let kuisIdAktif = null;

/* ===============================
   LOAD KUIS + CEK SUDAH KERJA?
=============================== */
firebase.auth().onAuthStateChanged(user => {

  if (!user) return;

  const uid = user.uid;

  kuisRef.once("value").then(snapshot => {

    listKuis.innerHTML = "";

    snapshot.forEach(item => {

      const k = item.val();
      const kuisId = item.key;

      nilaiRef.child(uid).child(kuisId)
        .once("value")
        .then(nilaiSnap => {

          // SUDAH KERJA
          if (nilaiSnap.exists()) {

            const nilai = nilaiSnap.val().skor;

            listKuis.innerHTML += `
              <div class="card mb-3 shadow-sm">
                <div class="card-body">
                  <h5>${k.judul}</h5>
                  <span class="badge bg-success">
                    ✔ Sudah dikerjakan (Skor ${nilai})
                  </span>
                </div>
              </div>
            `;

          } else {

            // BELUM
            listKuis.innerHTML += `
              <div class="card mb-3 shadow-sm">
                <div class="card-body">
                  <h5>${k.judul}</h5>
                  <button class="btn btn-success"
                    onclick="mulaiKuis('${kuisId}')">
                    ▶ Mulai Kuis
                  </button>
                </div>
              </div>
            `;
          }

        });

    });

  });

});

/* ===============================
   MULAI KUIS
=============================== */
function mulaiKuis(kuisId) {

  kuisIdAktif = kuisId;

  kuisRef.child(kuisId).once("value").then(snap => {

    const data = snap.val();

    if (!data?.soal) {
      alert("Soal belum tersedia");
      return;
    }

    soalList = Object.values(data.soal);

    indexSoal = 0;
    skor = 0;

    listKuis.style.display = "none";

    tampilkanSoal();
  });
}

/* ===============================
   TAMPILKAN SOAL
=============================== */
function tampilkanSoal() {

  const s = soalList[indexSoal];

  quizArea.innerHTML = `
    <div class="card shadow p-4">

      <h5 class="fw-bold mb-3">
        ${indexSoal+1}. ${s.pertanyaan}
      </h5>

      ${buatOpsi("A",s)}
      ${buatOpsi("B",s)}
      ${buatOpsi("C",s)}
      ${buatOpsi("D",s)}

    </div>
  `;
}

function buatOpsi(kode,s){
  return `
    <div class="btn btn-outline-dark w-100 mb-2"
      onclick="jawab(this,'${kode}','${s.jawaban}')">
      ${kode}. ${s.opsi[kode]}
    </div>
  `;
}

/* ===============================
   JAWAB
=============================== */
function jawab(el,pilihan,benar){

  document
    .querySelectorAll(".btn-outline-dark")
    .forEach(b=>b.disabled=true);

  if(pilihan===benar){
    el.classList.replace("btn-outline-dark","btn-success");
    skor += 100/soalList.length;
  }else{
    el.classList.replace("btn-outline-dark","btn-danger");
  }

  setTimeout(()=>{
    indexSoal++;
    if(indexSoal<soalList.length){
      tampilkanSoal();
    }else{
      selesaiKuis();
    }
  },1000);
}

/* ===============================
   SELESAI
=============================== */
function selesaiKuis(){

  const nilai = Math.round(skor);

  quizArea.innerHTML = `
    <div class="card shadow text-center p-5 bg-success text-white">

      <h3>🎉 Kuis Selesai</h3>
      <h1 class="display-3 fw-bold">${nilai}</h1>

      <p class="mt-2">Nilai kamu sudah tersimpan</p>

      <div class="d-flex justify-content-center gap-2 mt-4">

        <button class="btn btn-light"
          onclick="kembaliKeDaftar()">
          ⬅ Kembali ke Daftar Kuis
        </button>

      </div>

    </div>
  `;

  simpanNilai(nilai);
}

/* ===============================
   SIMPAN NILAI
=============================== */
function simpanNilai(nilaiAkhir){

  const user = firebase.auth().currentUser;
  if(!user) return;

  const uid = user.uid;

  db.ref("users/"+uid).once("value").then(snap=>{

    const u = snap.val();

    nilaiRef
      .child(uid)
      .child(kuisIdAktif)
      .set({
        nama:u?.nama||"",
        nim:u?.nim||"",
        skor:nilaiAkhir,
        tanggal:Date.now()
      });

  });
}

/* ===============================
   KEMBALI KE DAFTAR KUIS
=============================== */
function kembaliKeDaftar(){

  quizArea.innerHTML = "";
  listKuis.style.display = "block";

  // reload daftar kuis supaya tombol hilang
  location.reload();
}