const kuisRef = db.ref("kuis");
const nilaiRef = db.ref("nilai");

/* ===============================
   LOAD KUIS
=============================== */
kuisRef.once("value").then(snapshot => {

  const select = document.getElementById("pilihKuis");

  snapshot.forEach(item => {

    const k = item.val();

    select.innerHTML += `
      <option value="${item.key}">
        ${k.judul}
      </option>
    `;
  });

});

/* ===============================
   PILIH KUIS
=============================== */
document.getElementById("pilihKuis")
.addEventListener("change", e => {

  const kuisId = e.target.value;
  if(kuisId) tampilkanNilai(kuisId);

});

/* ===============================
   TAMPILKAN NILAI + RANKING
=============================== */
function tampilkanNilai(kuisId){

  const tbody = document.getElementById("tabelNilai");
  tbody.innerHTML="";

  nilaiRef.once("value").then(snapshot=>{

    let data = [];

    snapshot.forEach(userSnap=>{
      const n = userSnap.child(kuisId).val();
      if(n) data.push(n);
    });

    // SORT RANKING
    data.sort((a,b)=>b.skor-a.skor);

    if(data.length===0){
      tbody.innerHTML=
      "<tr><td colspan='5'>Belum ada nilai</td></tr>";
      return;
    }

    let total=0;

    data.forEach((d,i)=>{

      total += d.skor;

      tbody.innerHTML += `
        <tr>
          <td>${i+1}</td>
          <td>${d.nama}</td>
          <td>${d.nim}</td>
          <td><span class="badge bg-primary">#${i+1}</span></td>
          <td><span class="badge bg-success">${d.skor}</span></td>
        </tr>
      `;
    });

    tampilRata(total/data.length);

  });
}

/* ===============================
   RATA RATA KELAS
=============================== */
function tampilRata(rata){

  let box=document.getElementById("rataKelas");

  if(!box){
    box=document.createElement("div");
    box.id="rataKelas";
    box.className="alert alert-info mt-3 fw-bold";
    document.querySelector(".card-box")
      .appendChild(box);
  }

  box.innerHTML=
    "📊 Rata-rata kelas: "+rata.toFixed(1);
}