const socket = io();

socket.on("connect", () => {
  console.log("Conectado al servidor:", socket.id);

  const estado = document.getElementById("estado-servidor");
  if (estado) {
    estado.textContent = "Conectado al servidor";
    estado.style.color = "lime";
  }
});

socket.on("disconnect", () => {
  const estado = document.getElementById("estado-servidor");
  if (estado) {
    estado.textContent = "No conectado con el servidor";
    estado.style.color = "red";
  }
});

const form = document.getElementById("form-usuario");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!socket.connected) {
      alert("No conectado con el servidor");
      return;
    }

    const usuario = document.getElementById("usuario").value;
    const clave = document.getElementById("clave").value;

    socket.emit("crear-usuario", {
      usuario,
      clave
    });
  });
}

socket.on("usuario-creado", (respuesta) => {
  alert(respuesta.mensaje);
});