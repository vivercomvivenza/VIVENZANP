// ----------------------------
// script.js completo
// ----------------------------

// ----------------------------
// GALERIA (thumbs -> full images)
// ----------------------------

const imagens = [
  "imagem (1).jpg","imagem (2).jpg","imagem (3).jpg","imagem (4).jpg",
  "imagem (5).jpg","imagem (6).jpg","imagem (7).jpg","imagem (8).jpg",
  "imagem (9).jpg","imagem (10).jpg","imagem (11).jpg","imagem (12).jpg",
  "imagem (13).jpg","imagem (14).jpg","imagem (15).jpg","imagem (16).jpg",
  "imagem (17).jpg","imagem (18).jpg","imagem (19).jpg","imagem (20).jpg"
];

// thumbs pode ser diferente na sua pasta — ajuste nomes se necessário
const thumbs = [
  "20_thumbnail.jpg","19_thumbnail.jpg","18_thumbnail.jpg","17_thumbnail.jpg",
  "16_thumbnail.jpg","15_thumbnail.jpg","14_thumbnail.jpg","13_thumbnail.jpg",
  "12_thumbnail.jpg","11_thumbnail.jpg","10_thumbnail.jpg","9_thumbnail.jpg",
  "8_thumbnail.jpg","7_thumbnail.jpg","6_thumbnail.jpg","5_thumbnail.jpg",
  "4_thumbnail.jpg","3_thumbnail.jpg","2_thumbnail.jpg","1_thumbnail.jpg"
];

const galeria = document.getElementById("galeriaGrid");
const btnVerMais = document.getElementById("btnVerMais");

let exibidas = 0;
const quantidadeInicial = 4;

// Função para criar e abrir o viewer corretamente (centralizado, sem zoom estranho)
function abrirViewer(imagemFullSrc) {
  // cria container do viewer
  const viewer = document.createElement("div");
  viewer.className = "imagem-viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");

  // background que fecha ao clicar
  const bg = document.createElement("div");
  bg.className = "viewer-bg";
  bg.style.position = "absolute";
  bg.style.inset = "0";
  bg.style.cursor = "pointer";

  // content (centra com flex)
  const content = document.createElement("div");
  content.className = "viewer-content";
  content.style.position = "relative";
  content.style.display = "flex";
  content.style.alignItems = "center";
  content.style.justifyContent = "center";
  content.style.width = "100%";
  content.style.height = "100%";
  content.style.boxSizing = "border-box";
  content.style.padding = "12px";

  // img element - aplicamos estilos inline para garantir comportamento
  const img = document.createElement("img");
  img.className = "viewer-img";
  img.src = imagemFullSrc;
  img.alt = "Foto — Vivenza";
  // estilos críticos para garantir que a imagem caiba e NÃO seja "zoomada" em um canto
  img.style.maxWidth = "95%";
  img.style.maxHeight = "95%";
  img.style.objectFit = "contain";
  img.style.display = "block";
  img.style.margin = "0 auto";
  img.style.borderRadius = "8px";
  img.style.boxShadow = "0 16px 40px rgba(0,0,0,0.6)";

  // botão fechar (X) no canto superior direito (acessível)
  const btnClose = document.createElement("button");
  btnClose.className = "viewer-close";
  btnClose.innerHTML = "&times;";
  btnClose.style.position = "absolute";
  btnClose.style.top = "12px";
  btnClose.style.right = "12px";
  btnClose.style.width = "44px";
  btnClose.style.height = "44px";
  btnClose.style.borderRadius = "999px";
  btnClose.style.border = "none";
  btnClose.style.background = "rgba(255,255,255,0.92)";
  btnClose.style.fontSize = "22px";
  btnClose.style.cursor = "pointer";
  btnClose.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";

  // montar árvore
  content.appendChild(img);
  content.appendChild(btnClose);
  viewer.appendChild(bg);
  viewer.appendChild(content);
  document.body.appendChild(viewer);

  // bloquear scroll da página
  document.body.classList.add("no-scroll");
  document.body.style.overflow = "hidden";

  // função de fechar (remove viewer e restaura scroll)
  function fechar() {
    if (viewer && viewer.parentNode) viewer.parentNode.removeChild(viewer);
    document.body.classList.remove("no-scroll");
    document.body.style.overflow = ""; // restaura
  }

  // fechar clicando no background ou no botão
  bg.addEventListener("click", fechar);
  btnClose.addEventListener("click", fechar);

  // fechar com ESC
  function onEsc(e) {
    if (e.key === "Escape") fechar();
  }
  document.addEventListener("keydown", onEsc, { once: true });

  // quando imagem carregar, garantir que esteja centralizada e sem zoom (já setado via estilos)
  img.addEventListener("load", () => {
    // nada complexo aqui — o CSS inline garante 'contain' e centralização
    // podemos forçar foco no botão fechar por acessibilidade
    btnClose.focus();
  });
}

// adiciona imagens à galeria (mantendo a organização atual)
function adicionarImagens(qtd) {
  for (let i = 0; i < qtd && exibidas < imagens.length; i++) {
    const index = exibidas;
    const imgReal = imagens[index];
    const thumb = thumbs[index];

    const div = document.createElement("div");
    div.className = "thumb-container";

    const img = document.createElement("img");
    img.src = thumb;
    img.alt = `Imagem ${index + 1}`;
    img.className = "thumb";
    img.loading = "lazy"; // ajuda a não pesar o site

    // data attribute com o caminho da imagem full (pra abrir no viewer)
    img.dataset.full = imgReal;

    // quando clicar, abre o viewer com a imagem full (não carregamos outra cópia gigante antes)
    img.addEventListener("click", (e) => {
      const srcFull = e.currentTarget.dataset.full;
      abrirViewer(srcFull);
    });

    div.appendChild(img);
    galeria.appendChild(div);

    exibidas++;
  }

  if (exibidas >= imagens.length) {
    btnVerMais.style.display = "none";
  }
}

// inicializa
adicionarImagens(quantidadeInicial);

btnVerMais.addEventListener("click", () => adicionarImagens(4));


// ----------------------------
// MAPA — circleMarkers + fitBounds (mostra os 4 pontos)
// ----------------------------

// Coordenadas centrais aproximadas (mantidas mas não cruciais)
const CENTER_LAT = -29.3905;
const CENTER_LON = -51.0000;
const INITIAL_ZOOM = 13;

// Pontos (decimal)
const pontosColeta = [
  [-29.39278, -51.00528],
  [-29.38750, -51.00278],
  [-29.38722, -50.99167],
  [-29.39028, -50.98361]
];

let map = null;

function initializeMap() {
  // se já existir, remove (evita conflitos)
  if (map !== null) {
    try { map.remove(); } catch (err) { /* ignore */ }
  }

  // cria mapa
  map = L.map('map', { zoomControl: true }).setView([CENTER_LAT, CENTER_LON], INITIAL_ZOOM);

  // tiles OSM
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // estilo das bolinhas (circleMarker)
  const estiloBolinhas = {
    radius: 8,
    fillColor: "#d4af37", // cor laranjada/dourada do tema
    color: "#3a3a3a",     // borda escura
    weight: 2,
    opacity: 1,
    fillOpacity: 0.95
  };

  // adiciona circleMarkers
  pontosColeta.forEach((coord, i) => {
    L.circleMarker(coord, estiloBolinhas)
      .addTo(map)
      .bindPopup(`<b>Ponto de Coleta ${i + 1}</b><br>Nove Colônias`);
  });

  // garante que todos os pontos fiquem visíveis na inicialização
  try {
    const bounds = L.latLngBounds(pontosColeta);
    map.fitBounds(bounds, { padding: [40, 40] });
  } catch (err) {
    // fallback: se algo falhar, garante um setView
    map.setView([CENTER_LAT, CENTER_LON], INITIAL_ZOOM);
  }
}

// inicia mapa
initializeMap();

// botao recarregar mapa
const refreshButton = document.getElementById('refreshMap');
if (refreshButton) {
  refreshButton.addEventListener('click', initializeMap);
}
