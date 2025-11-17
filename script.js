// script.js — versão compatível com CDN Leaflet (usa L global)
// Colar inteiro substituindo o arquivo antigo

document.addEventListener('DOMContentLoaded', () => {
  // coordenadas (mesmas que você usou)
  const coords = [
    [-29.392778, -51.005278], // 29°23'34"S 51°00'19"W
    [-29.3875,   -51.002778], // 29°23'15"S 51°00'10"W
    [-29.387222, -50.991667], // 29°23'14"S 50°59'30"W
    [-29.390278, -50.983611]  // 29°23'25"S 50°59'01"W
  ];

  // --- inicializa o mapa só depois de garantir que 'L' existe ---
  if (typeof L === 'undefined') {
    console.error('Leaflet (L) não encontrado. Verifique se o <script src="https://unpkg.com/leaflet..."> está antes do script.js no HTML.');
    return;
  }

  const mapEl = document.getElementById('map');
  // cria o mapa
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(coords[0], 14);

  // tile layer (OpenStreetMap). Exige internet. Se estiver offline, substitua por imagem estática.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // marcador personalizado (igual ao que você tinha)
  const goldIcon = L.divIcon({
    className: 'vivenza-marker',
    html: '<div style="background:linear-gradient(180deg,#d4af37,#b68f2a); width:18px;height:18px;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.2);border:2px solid white;"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const markers = [];
  coords.forEach((c, i) => {
    const m = L.marker(c, { icon: goldIcon }).addTo(map)
      .bindPopup(`<strong>Ponto de Coleta ${i + 1}</strong><br>${formatDMS(c[0], c[1])}`);
    markers.push(m);
  });

  // ajustar bounds
  const bounds = L.latLngBounds(coords);
  map.fitBounds(bounds.pad(0.2));

  // refresh/reset button
  const refreshBtn = document.getElementById('refreshMap');
  if (refreshBtn){
    refreshBtn.addEventListener('click', () => {
      // botão tem dois comportamentos no teu site (recarregar mapa ou abrir fullscreen dependendo do estado)
      // Aqui apenas recarregamos o mapa e movemos a view para os marcadores
      map.invalidateSize();
      map.closePopup();
      markers.forEach(m => { if (!map.hasLayer(m)) m.addTo(map); });
      map.fitBounds(bounds.pad(0.2));
      // animação rápida para feedback
      try {
        refreshBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 });
      } catch(e){}
    });
  }

  // Reveal on scroll (mesmo que tenha no teu código original)
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => obs.observe(r));

  // Back to top button
  const back = document.getElementById('backTop');
  if (back){
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 200;
      back.style.opacity = show ? '1' : '0';
      back.style.pointerEvents = show ? 'auto' : 'none';
    });
  }

  // se o mapa estiver escondido por CSS, chamar invalidateSize após small timeout
  setTimeout(()=> map.invalidateSize(), 300);

}); // DOMContentLoaded

/* Utilities */
function formatDMS(lat, lon){
  function toDMS(deg){
    const d = Math.floor(Math.abs(deg));
    const mFloat = (Math.abs(deg) - d) * 60;
    const m = Math.floor(mFloat);
    const s = Math.round((mFloat - m) * 60);
    return {d,m,s};
  }
  const la = toDMS(lat), lo = toDMS(lon);
  const latHem = lat < 0 ? "S" : "N";
  const lonHem = lon < 0 ? "W" : "E";
  return `${la.d}°${la.m}'${la.s}"${latHem} ${lo.d}°${lo.m}'${lo.s}"${lonHem}`;
}