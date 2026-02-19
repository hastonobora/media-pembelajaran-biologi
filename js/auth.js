// ===============================
// REGISTER (NAMA + NIM)
// ===============================

function register() {
  const nama = document.getElementById("nama").value.trim();
  const nim = document.getElementById("nim").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!nama || !nim || !password || !role) {
    alert("Lengkapi semua data!");
    return;
  }

  // Email unik dari NIM
  const email = nim + "@ipa.local";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // SIMPAN ROLE SESUAI PILIHAN
      return db.ref("users/" + uid).set({
        nama: nama,
        nim: nim,
        email: email,
        role: role.toLowerCase()   // ⬅️ INI KUNCI
      });
    })
    .then(() => {
      alert("Registrasi berhasil, silakan login.");
      window.location.href = "index.html";
    })
    .catch(error => {
      alert(error.message);
    });
}


// ===============================
// LOGIN (NIM + PASSWORD)
// ===============================
function login() {
  const nim = document.getElementById("nim").value.trim();
  const password = document.getElementById("password").value;

  if (!nim || !password) {
    alert("NIM dan Password wajib diisi!");
    return;
  }

  const email = nim + "@ipa.local";

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // AMBIL DATA USER SAJA, JANGAN TIMPA
      return db.ref("users/" + uid).once("value");
    })
    .then((snapshot) => {
      const data = snapshot.val();

      if (!data || !data.role) {
        alert("Role belum diset. Hubungi admin.");
        return;
      }

      const role = data.role.toLowerCase().trim();

      if (role === "guru") {
        window.location.assign("./guru/dashboard.html");
      } else if (role === "mahasiswa") {
        window.location.assign("./mahasiswa/dashboard.html");
      } else {
        alert("Role tidak valid: " + data.role);
      }
    })
    .catch(error => {
      alert("Login gagal: " + error.message);
    });
}