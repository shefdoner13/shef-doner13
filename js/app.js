// Шеф Донер 13: меню из datos/productos.json с поиском, фильтром и карточкой блюда.
const TELEFONO = "tel:+79263881312";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const cont = document.getElementById("catalogo");
  const vacio = document.getElementById("vacio");
  const busqueda = document.getElementById("busqueda");
  const filtros = document.getElementById("categoria");
  const ficha = document.getElementById("ficha");
  const contenido = document.getElementById("ficha-contenido");

  let productos = [];
  try {
    const respuesta = await fetch("datos/productos.json");
    if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
    productos = await respuesta.json();
  } catch (error) {
    vacio.hidden = false;
    vacio.textContent = "Меню не загрузилось. Позвоните нам, и мы всё подскажем: +7-926-388-13-12.";
    return;
  }

  const categorias = [...new Set(productos.map((p) => p.categoria))];
  const numero = new Intl.NumberFormat("ru-RU");
  const precio = (valor) => numero.format(valor) + " ₽";
  const normal = (texto) => texto.toLowerCase().replace(/ё/g, "е").trim();

  function posiciones(cantidad) {
    const decenas = Math.abs(cantidad) % 100;
    const unidades = decenas % 10;
    if (decenas > 10 && decenas < 20) return cantidad + " позиций";
    if (unidades === 1) return cantidad + " позиция";
    if (unidades >= 2 && unidades <= 4) return cantidad + " позиции";
    return cantidad + " позиций";
  }

  let filtro = "";
  let consulta = "";

  const opciones = [{ valor: "", texto: "Всё меню" }].concat(
    categorias.map((categoria) => ({ valor: categoria, texto: categoria }))
  );

  opciones.forEach((opcion) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filtro";
    boton.textContent = opcion.texto;
    boton.dataset.valor = opcion.valor;
    boton.setAttribute("aria-pressed", String(opcion.valor === ""));
    boton.addEventListener("click", () => {
      filtro = opcion.valor;
      filtros.querySelectorAll(".filtro").forEach((otro) => {
        otro.setAttribute("aria-pressed", String(otro.dataset.valor === filtro));
      });
      pintar();
    });
    filtros.appendChild(boton);
  });

  function crearTarjeta(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "button");
    tarjeta.setAttribute(
      "aria-label",
      producto.nombre + " — " + precio(producto.precio) + ". " + producto.descripcion
    );

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = "lazy";
    imagen.width = 84;
    imagen.height = 84;

    const cuerpo = document.createElement("div");
    cuerpo.className = "tarjeta-cuerpo";

    if (producto.etiqueta) {
      const etiqueta = document.createElement("span");
      etiqueta.className = "etiqueta";
      etiqueta.textContent = producto.etiqueta;
      cuerpo.appendChild(etiqueta);
    }

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = producto.descripcion;

    const importe = document.createElement("span");
    importe.className = "precio";
    importe.textContent = precio(producto.precio);

    cuerpo.append(nombre, descripcion, importe);
    tarjeta.append(imagen, cuerpo);

    const abrir = () => abrirFicha(producto);
    tarjeta.addEventListener("click", abrir);
    tarjeta.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrir();
      }
    });

    return tarjeta;
  }

  function abrirFicha(producto) {
    contenido.textContent = "";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.width = 440;
    imagen.height = 440;

    const texto = document.createElement("div");
    texto.className = "ficha-texto";

    if (producto.etiqueta) {
      const etiqueta = document.createElement("span");
      etiqueta.className = "etiqueta";
      etiqueta.textContent = producto.etiqueta;
      texto.appendChild(etiqueta);
    }

    const nombre = document.createElement("h2");
    nombre.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = producto.descripcion;

    const importe = document.createElement("span");
    importe.className = "precio";
    importe.textContent = precio(producto.precio);

    const llamar = document.createElement("a");
    llamar.className = "boton boton-primario";
    llamar.href = TELEFONO;
    llamar.textContent = "Позвонить и заказать";

    texto.append(nombre, descripcion, importe, llamar);
    contenido.append(imagen, texto);

    if (typeof ficha.showModal === "function") {
      ficha.showModal();
    } else {
      window.location.href = TELEFONO;
    }
  }

  function pintar() {
    cont.textContent = "";
    let total = 0;

    for (const categoria of categorias) {
      if (filtro && categoria !== filtro) continue;

      const lista = productos.filter((producto) => {
        if (producto.categoria !== categoria) return false;
        if (!consulta) return true;
        return normal(producto.nombre + " " + producto.descripcion).includes(consulta);
      });

      if (!lista.length) continue;
      total += lista.length;

      const seccion = document.createElement("section");
      seccion.className = "categoria-bloque";
      seccion.setAttribute("aria-label", categoria);

      const titulo = document.createElement("h2");
      titulo.className = "categoria-titulo";
      titulo.append(document.createTextNode(categoria));

      const cuenta = document.createElement("span");
      cuenta.className = "cuenta";
      cuenta.textContent = posiciones(lista.length);
      titulo.appendChild(cuenta);

      const rejilla = document.createElement("div");
      rejilla.className = "rejilla";
      lista.forEach((producto) => rejilla.appendChild(crearTarjeta(producto)));

      seccion.append(titulo, rejilla);
      cont.appendChild(seccion);
    }

    vacio.hidden = total > 0;
  }

  ficha.querySelector(".cerrar").addEventListener("click", () => ficha.close());
  ficha.addEventListener("click", (evento) => {
    if (evento.target === ficha) ficha.close();
  });

  busqueda.addEventListener("input", () => {
    consulta = normal(busqueda.value);
    pintar();
  });

  pintar();
});
