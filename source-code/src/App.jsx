import { useMemo, useState } from 'react';
import { FACTIONS, MAJOR_FACTIONS } from './data/factions.js';
import { ALL_CHARACTERS, ICONIC_CHARACTERS, charactersByFaction } from './data/characters.js';
import { LOCATIONS, LOCATION_MAP } from './data/locations.js';
import { ROADS } from './data/roads.js';
import { advanceRandomPlaces, createRandomPlaces, advanceWanderers, createWanderers } from './utils/randomPlaces.js';

const VIEW_MODES = [
  { id: 'faction', label: 'Faksi' },
  { id: 'iconic', label: 'Tokoh Ikonik' },
  { id: 'characters', label: 'Direktori' },
  { id: 'relations', label: 'Graph Relasi' },
  { id: 'routes', label: 'Jalur Strategis' },
  { id: 'terrain', label: 'Atlas Terrain' },
  { id: 'map', label: 'Peta Interaktif' },
];

const TERRITORIES = [
  { id: 'silven', path: 'M190 150 C250 105 330 118 365 180 C390 230 370 300 310 332 C240 365 165 345 135 280 C112 228 128 180 190 150 Z', labelX: 245, labelY: 210 },
  { id: 'thornwall', path: 'M480 110 C545 78 635 90 685 132 C722 165 725 220 676 250 C620 280 530 274 478 240 C436 213 430 140 480 110 Z', labelX: 575, labelY: 170 },
  { id: 'azurra', path: 'M840 155 C930 135 1026 175 1072 240 C1105 288 1095 360 1025 395 C954 428 864 418 812 372 C762 328 760 196 840 155 Z', labelX: 928, labelY: 250 },
  { id: 'varath', path: 'M330 320 C410 295 500 320 545 390 C580 446 555 522 490 565 C420 606 322 585 270 526 C225 478 238 350 330 320 Z', labelX: 405, labelY: 430 },
  { id: 'ashkari', path: 'M760 470 C850 445 960 470 1014 545 C1056 602 1046 684 970 724 C892 765 776 756 714 704 C654 654 662 510 760 470 Z', labelX: 860, labelY: 590 },
  { id: 'pirate', path: 'M535 638 C610 604 715 612 786 660 C836 694 844 758 795 802 C746 845 646 858 570 834 C505 813 451 742 470 690 C481 664 507 649 535 638 Z', labelX: 650, labelY: 715 },
  { id: 'orc', path: 'M255 372 C300 360 338 378 348 420 C356 455 326 490 283 492 C240 494 212 460 215 425 C219 399 233 378 255 372 Z', labelX: 282, labelY: 420 },
  { id: 'moon', path: 'M298 620 C340 605 390 620 414 658 C434 690 423 729 385 748 C348 767 304 758 277 732 C250 706 258 636 298 620 Z', labelX: 340, labelY: 680 },
  { id: 'ancient', path: 'M640 82 C678 66 720 78 742 108 C757 128 754 157 725 173 C696 190 650 188 626 162 C602 137 604 97 640 82 Z', labelX: 684, labelY: 122 },
  { id: 'rust', path: 'M755 110 C794 98 840 106 862 135 C882 162 876 196 844 212 C810 230 758 228 731 204 C705 179 716 121 755 110 Z', labelX: 796, labelY: 150 },
  { id: 'demon', path: 'M997 620 C1032 604 1072 613 1093 641 C1112 667 1107 704 1080 726 C1048 750 1000 748 974 724 C949 701 960 637 997 620 Z', labelX: 1035, labelY: 668 },
  { id: 'eldara', path: 'M90 95 C130 84 168 95 183 126 C197 154 182 187 148 198 C116 209 83 204 59 185 C35 166 51 106 90 95 Z', labelX: 122, labelY: 140 },
];

const MOUNTAINS = [
  [420, 360], [455, 330], [490, 305], [530, 285], [585, 300], [633, 330], [688, 385], [748, 460], [300, 250], [350, 220], [780, 210]
];
const FORESTS = [
  [210, 195], [250, 215], [285, 245], [225, 260], [315, 290], [188, 308], [335, 355], [350, 650], [330, 690]
];
const RIVERS = [
  'M320 180 C350 250 372 300 410 350 C438 390 458 440 455 510',
  'M705 155 C742 220 760 292 742 360 C728 408 712 456 700 510',
  'M228 405 C205 455 190 520 205 575 C216 615 238 652 255 694',
];

const CONTOURS = [
  'M168 170 C260 114 356 116 438 148 C520 102 653 102 762 136 C868 170 973 258 1008 350 C1035 421 1018 546 945 650 C864 755 724 790 594 768 C482 790 376 770 286 715 C202 664 157 570 154 472 C151 365 122 241 168 170 Z',
  'M224 210 C296 175 374 178 456 208 C546 172 640 174 728 205 C818 237 915 302 950 380 C984 456 954 556 890 620 C810 702 700 728 594 710 C504 728 412 710 336 662 C266 618 223 540 224 458 C225 366 188 270 224 210 Z',
  'M304 285 C380 250 470 266 540 305 C610 265 704 280 775 326 C848 374 880 462 842 548 C802 638 694 670 594 655 C506 670 424 650 362 604 C300 558 270 430 304 285 Z',
];

const BIOME_PATCHES = [
  { cls: 'biome forest', path: 'M140 170 C235 120 338 136 370 220 C395 285 330 360 235 358 C160 356 104 300 112 238 C116 205 124 185 140 170 Z' },
  { cls: 'biome swamp', path: 'M174 390 C236 354 304 378 326 432 C350 492 308 560 238 562 C175 564 130 516 142 456 C148 426 155 406 174 390 Z' },
  { cls: 'biome volcano', path: 'M310 318 C392 280 503 306 550 392 C593 470 548 560 455 596 C370 630 278 592 248 512 C220 434 242 354 310 318 Z' },
  { cls: 'biome hills', path: 'M430 90 C534 55 680 70 745 135 C800 190 768 270 680 302 C586 338 464 300 420 225 C392 178 390 116 430 90 Z' },
  { cls: 'biome coast', path: 'M785 150 C900 112 1036 180 1080 280 C1122 374 1055 455 940 462 C820 468 746 385 750 275 C752 216 755 170 785 150 Z' },
  { cls: 'biome steppe', path: 'M718 452 C844 420 1004 470 1040 586 C1074 696 928 780 770 742 C648 713 616 548 718 452 Z' },
  { cls: 'biome reef', path: 'M502 640 C600 600 744 610 815 686 C870 745 802 840 675 850 C548 860 452 790 464 705 C468 675 480 654 502 640 Z' },
  { cls: 'biome cursed', path: 'M970 600 C1040 572 1104 620 1114 684 C1124 754 1038 790 980 752 C925 716 916 626 970 600 Z' },
];

const FORTRESS_ROUTES = [
  { from: 'menara-thornwall', to: 'kota-bara', name: 'Koridor Mahkota-Abu', type: 'strategic' },
  { from: 'kota-bara', to: 'pelabuhan-besi', name: 'Jalur Besi Varath', type: 'military' },
  { from: 'pelabuhan-biru', to: 'benteng-karang-selatan', name: 'Rute Laut Biru-Selatan', type: 'naval' },
  { from: 'padang-kalikri', to: 'retakan-varkhazan', name: 'Front Badai Timur', type: 'warfront' },
  { from: 'hutan-akar-tua', to: 'benteng-abur', name: 'Jalur Duri-Api', type: 'contested' },
  { from: 'benteng-karang-selatan', to: 'pelabuhan-besi', name: 'Rute Serbuan Karang', type: 'raid' },
  { from: 'celah-angin', to: 'ngarai-abu', name: 'Jalur Artefak Terlarang', type: 'secret' },
];

function App() {
  const [view, setView] = useState('faction');
  const [selectedFaction, setSelectedFaction] = useState('varath');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [turn, setTurn] = useState(1);
  const [query, setQuery] = useState('');
  const [characterScope, setCharacterScope] = useState('all');
  const [randomPlaces, setRandomPlaces] = useState(() => createRandomPlaces());
  const [wanderers, setWanderers] = useState(() => createWanderers());

  const allLocations = useMemo(() => [...LOCATIONS, ...randomPlaces], [randomPlaces]);
  const locationMap = useMemo(() => new Map(allLocations.map((loc) => [loc.id, loc])), [allLocations]);

  const factionCharacters = useMemo(() => charactersByFaction(selectedFaction), [selectedFaction]);
  const factionIconics = useMemo(() => factionCharacters.filter((c) => c.kind === 'iconic'), [factionCharacters]);
  const factionLocations = useMemo(() => LOCATIONS.filter((l) => l.faction === selectedFaction), [selectedFaction]);

  const combinedCharacters = useMemo(() => {
    const wandererList = wanderers.map((w) => ({ ...w, locationId: w.currentLocationId, location: locationMap.get(w.currentLocationId)?.name || w.currentLocationId }));
    return [...ALL_CHARACTERS, ...wandererList];
  }, [wanderers, locationMap]);

  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combinedCharacters.filter((char) => {
      const factionPass = selectedFaction === 'all' ? true : characterScope === 'free' || characterScope === 'wanderer' ? true : char.faction === selectedFaction;
      const scopePass =
        characterScope === 'all' ? true :
        characterScope === 'iconic' ? char.kind === 'iconic' :
        characterScope === 'support' ? char.kind === 'support' :
        characterScope === 'free' ? char.kind === 'free' || (char.faction === 'neutral' && char.kind !== 'wanderer') :
        characterScope === 'wanderer' ? char.kind === 'wanderer' : true;
      const searchPass = !q || [char.name, char.role, char.location, char.bio, char.drama, FACTIONS[char.faction]?.name].join(' ').toLowerCase().includes(q);
      return factionPass && scopePass && searchPass;
    });
  }, [combinedCharacters, query, selectedFaction, characterScope]);

  const selectedFactionData = selectedFaction === 'all' ? null : FACTIONS[selectedFaction];

  function nextTurn() {
    setTurn((t) => t + 1);
    setRandomPlaces((prev) => advanceRandomPlaces(prev));
    setWanderers((prev) => advanceWanderers(prev));
  }

  function handleSelectFaction(factionId) {
    setSelectedFaction(factionId);
    setSelectedCharacter(null);
    setSelectedLocation(null);
    setView('faction');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Nusantara Kaldera · Worldbuilding Interactive</div>
          <h1>Peta, Faksi, dan Karakter Kaldera</h1>
          <p>
            Fokus utama sekarang adalah <b>list faksi dan karakter</b>, dengan peta tekstur ala medieval sebagai tampilan detail.
          </p>
        </div>
        <div className="top-actions">
          <button className="primary" onClick={nextTurn}>Turn {turn} · Lanjutkan</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar left-panel">
          <div className="panel-title">Mode Tampilan</div>
          <div className="mode-switch">
            {VIEW_MODES.map((item) => (
              <button key={item.id} className={view === item.id ? 'mode-btn active' : 'mode-btn'} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="panel-title">Daftar Faksi</div>
          <button className={selectedFaction === 'all' ? 'faction-btn active' : 'faction-btn'} onClick={() => handleSelectFaction('all')}>
            🌍 Semua Karakter
          </button>
          {Object.values(FACTIONS).map((faction) => (
            <button
              key={faction.id}
              className={selectedFaction === faction.id ? 'faction-btn active' : 'faction-btn'}
              style={{ borderLeftColor: faction.color }}
              onClick={() => handleSelectFaction(faction.id)}
            >
              <span>{faction.symbol}</span>
              <div>
                <strong>{faction.name}</strong>
                <small>{faction.major ? 'Faksi Besar' : faction.id === 'neutral' ? 'Bebas' : 'Faksi Tambahan'}</small>
              </div>
            </button>
          ))}

          <div className="mini-stats">
            <div><b>{Object.keys(FACTIONS).length}</b><span>Total Faksi</span></div>
            <div><b>{LOCATIONS.length}</b><span>Wilayah Tetap</span></div>
            <div><b>{randomPlaces.length}</b><span>Tempat Random</span></div>
            <div><b>{combinedCharacters.length}</b><span>Total Karakter</span></div>
          </div>
        </aside>

        <main className="content-panel">
          {view === 'faction' && (
            <FactionView
              faction={selectedFactionData}
              factionId={selectedFaction}
              factionCharacters={selectedFaction === 'all' ? combinedCharacters : factionCharacters}
              iconics={selectedFaction === 'all' ? ICONIC_CHARACTERS : factionIconics}
              factionLocations={selectedFaction === 'all' ? LOCATIONS : factionLocations}
              onCharacter={setSelectedCharacter}
              onLocation={setSelectedLocation}
              onGoCharacters={() => setView('characters')}
              onGoMap={() => setView('map')}
            />
          )}

          {view === 'iconic' && (
            <IconicView
              selectedFaction={selectedFaction}
              iconics={selectedFaction === 'all' ? ICONIC_CHARACTERS : factionIconics}
              onCharacter={setSelectedCharacter}
            />
          )}

          {view === 'characters' && (
            <CharactersView
              selectedFaction={selectedFaction}
              setSelectedFaction={setSelectedFaction}
              query={query}
              setQuery={setQuery}
              scope={characterScope}
              setScope={setCharacterScope}
              characters={filteredCharacters}
              onCharacter={setSelectedCharacter}
            />
          )}

          {view === 'relations' && (
            <RelationsView
              selectedFaction={selectedFaction}
              iconics={selectedFaction === 'all' ? ICONIC_CHARACTERS : factionIconics}
              onCharacter={setSelectedCharacter}
            />
          )}

          {view === 'routes' && (
            <StrategicRoutesView
              locationMap={locationMap}
              selectedFaction={selectedFaction}
              onLocation={setSelectedLocation}
            />
          )}

          {view === 'terrain' && (
            <TerrainAtlasView
              selectedFaction={selectedFaction}
              allLocations={allLocations}
              locationMap={locationMap}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              setSelectedCharacter={setSelectedCharacter}
            />
          )}

          {view === 'map' && (
            <MapView
              selectedFaction={selectedFaction}
              allLocations={allLocations}
              locationMap={locationMap}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              setSelectedCharacter={setSelectedCharacter}
            />
          )}
        </main>

        <aside className="sidebar right-panel">
          {selectedCharacter ? (
            <CharacterDetail character={selectedCharacter} />
          ) : selectedLocation ? (
            <LocationDetail location={selectedLocation} characters={combinedCharacters.filter((char) => char.locationId === selectedLocation.id)} onCharacter={setSelectedCharacter} />
          ) : selectedFactionData ? (
            <FactionDetail faction={selectedFactionData} characters={factionCharacters} locations={factionLocations} />
          ) : (
            <GeneralDetail combinedCharacters={combinedCharacters} />
          )}
        </aside>
      </div>
    </div>
  );
}

function FactionView({ faction, factionId, factionCharacters, iconics, factionLocations, onCharacter, onLocation, onGoCharacters, onGoMap }) {
  if (factionId === 'all') {
    return (
      <section className="card-section">
        <div className="hero-card">
          <h2>Semua Faksi & Semua Karakter</h2>
          <p>
            Gunakan mode ini jika kamu ingin melihat keseluruhan dunia. Untuk pengalaman yang paling sesuai dengan kebutuhanmu,
            klik salah satu faksi di kiri agar karakter-karakternya langsung tampil sebagai list.
          </p>
          <div className="hero-actions">
            <button className="secondary" onClick={onGoCharacters}>Lihat Semua Karakter</button>
            <button className="secondary" onClick={onGoMap}>Buka Peta Detail</button>
          </div>
        </div>
        <div className="split-grid">
          {MAJOR_FACTIONS.map((factionKey) => {
            const factionData = FACTIONS[factionKey];
            const chars = charactersByFaction(factionKey);
            return (
              <div className="faction-summary" key={factionKey} style={{ borderTopColor: factionData.color }}>
                <h3>{factionData.symbol} {factionData.name}</h3>
                <p>{factionData.desc}</p>
                <div className="pill-row">
                  <span>{chars.filter((c) => c.kind === 'iconic').length} ikonik</span>
                  <span>{chars.length} total karakter</span>
                  <span>{LOCATIONS.filter((l) => l.faction === factionKey).length} wilayah</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="card-section">
      <div className="hero-card" style={{ borderTopColor: faction.color }}>
        <div className="hero-head">
          <h2>{faction.symbol} {faction.name}</h2>
          <div className="hero-actions">
            <button className="secondary" onClick={onGoCharacters}>Mode Karakter</button>
            <button className="secondary" onClick={onGoMap}>Mode Peta</button>
          </div>
        </div>
        <p>{faction.desc}</p>
        <div className="info-grid">
          <div><strong>Watak</strong><span>{faction.trait}</span></div>
          <div><strong>Kekuatan</strong><span>{faction.power || 'Beragam, tergantung struktur faksi'}</span></div>
          <div><strong>Kelemahan</strong><span>{faction.weakness || 'Belum dicatat'}</span></div>
          <div><strong>Sejarah</strong><span>{faction.history}</span></div>
        </div>
      </div>

      <div className="subsection">
        <h3>Karakter Ikonik {faction.name}</h3>
        <p className="muted">Ini adalah tokoh utama yang ceritanya saling sambung, penuh plot twist, hubungan keluarga, rivalitas, dan pengkhianatan.</p>
        <div className="character-grid">
          {iconics.map((character) => (
            <CharacterCard key={character.id} character={character} onClick={() => onCharacter(character)} />
          ))}
        </div>
      </div>

      <div className="subsection">
        <h3>Semua Karakter Faksi</h3>
        <div className="simple-list">
          {factionCharacters.map((character) => (
            <button className="list-card" key={character.id} onClick={() => onCharacter(character)}>
              <div>
                <strong>{character.name}</strong>
                <small>{character.role} · {character.kind}</small>
              </div>
              <span>{character.location}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <h3>Wilayah Faksi</h3>
        <div className="location-grid">
          {factionLocations.map((loc) => (
            <button className="location-card" key={loc.id} onClick={() => onLocation(loc)}>
              <div className="location-top"><span>{loc.icon}</span><strong>{loc.name}</strong></div>
              <small>{loc.type} · Pop. {loc.pop.toLocaleString('id-ID')}</small>
              <p>{loc.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}


function IconicView({ selectedFaction, iconics, onCharacter }) {
  const title = selectedFaction === 'all' ? 'Semua Tokoh Ikonik' : `Tokoh Ikonik ${FACTIONS[selectedFaction]?.name || ''}`;
  const countByFaction = iconics.reduce((acc, c) => ({ ...acc, [c.faction]: (acc[c.faction] || 0) + 1 }), {});
  return (
    <section className="card-section">
      <div className="hero-card gold-panel">
        <h2>⭐ {title}</h2>
        <p>
          Menu ini khusus untuk karakter ikonik. Klik satu karakter untuk membuka panel kanan yang berisi halaman panjang:
          biografi utama, drama saat ini, rahasia besar, psikologi tokoh, arc campaign, hook adegan, ending, dan graph relasi.
        </p>
        <div className="pill-row wrap">
          <span>{iconics.length} tokoh ikonik tampil</span>
          {Object.entries(countByFaction).map(([fid, count]) => <span key={fid}>{FACTIONS[fid]?.symbol} {count}</span>)}
        </div>
      </div>
      <div className="iconic-showcase">
        {iconics.map((character) => {
          const faction = FACTIONS[character.faction] || FACTIONS.neutral;
          return (
            <button key={character.id} className="iconic-long-card" onClick={() => onCharacter(character)} style={{ borderLeftColor: faction.color }}>
              <div className="portrait-mark" style={{ background: faction.color }}>{faction.symbol}</div>
              <div>
                <h3>{character.name}</h3>
                <small>{character.role} · {faction.name} · {character.location}</small>
                <p>{character.bio}</p>
                <div className="iconic-preview-grid">
                  <span><b>Drama:</b> {character.drama}</span>
                  <span><b>Rahasia:</b> {character.secret}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RelationsView({ selectedFaction, iconics, onCharacter }) {
  const nodes = iconics.slice(0, 36);
  return (
    <section className="card-section">
      <div className="hero-card violet-panel">
        <h2>🕸️ Graph Relasi Antar Tokoh</h2>
        <p>
          Ini bukan hanya panel kecil. Menu ini memperlihatkan jaringan hubungan tokoh ikonik: keluarga, rival, pengkhianatan,
          hubungan rahasia, dendam, sahabat, dan koneksi lintas faksi. Klik kartu tokoh untuk detail halaman panjang di kanan.
        </p>
      </div>
      <div className="relation-board">
        <svg viewBox="0 0 1100 620" className="world-relation-svg">
          <defs>
            <filter id="relShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.22"/></filter>
          </defs>
          {nodes.map((char, index) => {
            const cx = 550 + Math.cos((index / nodes.length) * Math.PI * 2) * (index % 2 ? 420 : 320);
            const cy = 310 + Math.sin((index / nodes.length) * Math.PI * 2) * (index % 2 ? 230 : 170);
            const faction = FACTIONS[char.faction] || FACTIONS.neutral;
            return (char.connections || []).slice(0, 2).map((_, relIndex) => {
              const targetIndex = (index + relIndex * 5 + 3) % nodes.length;
              const tx = 550 + Math.cos((targetIndex / nodes.length) * Math.PI * 2) * (targetIndex % 2 ? 420 : 320);
              const ty = 310 + Math.sin((targetIndex / nodes.length) * Math.PI * 2) * (targetIndex % 2 ? 230 : 170);
              return <line key={`${char.id}-${relIndex}`} x1={cx} y1={cy} x2={tx} y2={ty} stroke={faction.color} strokeWidth="1.5" opacity="0.22" />;
            });
          })}
          {nodes.map((char, index) => {
            const cx = 550 + Math.cos((index / nodes.length) * Math.PI * 2) * (index % 2 ? 420 : 320);
            const cy = 310 + Math.sin((index / nodes.length) * Math.PI * 2) * (index % 2 ? 230 : 170);
            const faction = FACTIONS[char.faction] || FACTIONS.neutral;
            return (
              <g key={char.id} className="world-node" onClick={() => onCharacter(char)}>
                <circle cx={cx} cy={cy} r="28" fill={faction.color} stroke="#fff4da" strokeWidth="3" filter="url(#relShadow)" />
                <text x={cx} y={cy+5} textAnchor="middle" fill="#fff" fontWeight="800">{faction.symbol}</text>
                <text x={cx} y={cy+45} textAnchor="middle" className="world-node-label">{char.name.split(' ').slice(0,2).join(' ')}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="character-grid bigger">
        {nodes.map((character) => <CharacterCard key={character.id} character={character} onClick={() => onCharacter(character)} />)}
      </div>
    </section>
  );
}

function StrategicRoutesView({ locationMap, selectedFaction, onLocation }) {
  const visibleRoutes = FORTRESS_ROUTES.filter((route) => {
    if (selectedFaction === 'all') return true;
    const from = locationMap.get(route.from);
    const to = locationMap.get(route.to);
    return from?.faction === selectedFaction || to?.faction === selectedFaction;
  });
  return (
    <section className="card-section">
      <div className="hero-card red-panel">
        <h2>⚔️ Jalur Strategis ala Romance of Three Kingdoms</h2>
        <p>
          Menu ini dibuat untuk membaca perang seperti ROTK: kastil, pelabuhan, benteng, chokepoint, jalur suplai,
          rute serbuan, dan front perang. Setiap jalur bisa menjadi titik invasi, negosiasi, atau perebutan logistik.
        </p>
      </div>
      <div className="route-chronicle">
        {visibleRoutes.map((route) => {
          const from = locationMap.get(route.from);
          const to = locationMap.get(route.to);
          const fromFaction = FACTIONS[from?.faction] || FACTIONS.neutral;
          const toFaction = FACTIONS[to?.faction] || FACTIONS.neutral;
          return (
            <article key={route.name} className={`route-chronicle-card ${route.type}`}>
              <div className="route-title-row">
                <h3>{route.name}</h3>
                <span>{route.type}</span>
              </div>
              <div className="route-flow">
                <button onClick={() => onLocation(from)} style={{ borderColor: fromFaction.color }}>{from?.icon} {from?.name}</button>
                <strong>→</strong>
                <button onClick={() => onLocation(to)} style={{ borderColor: toFaction.color }}>{to?.icon} {to?.name}</button>
              </div>
              <p>{routeNarrative(route, from, to)}</p>
              <div className="pill-row wrap">
                <span>Suplai</span><span>Chokepoint</span><span>Diplomasi</span><span>Front Perang</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function routeNarrative(route, from, to) {
  const base = {
    strategic: 'Koridor ini menentukan siapa yang bisa memproyeksikan legitimasi politik ke pusat benua. Cocok untuk intrik mahkota, pengawalan bangsawan, dan serangan simbolik.',
    military: 'Jalur ini adalah urat nadi logistik perang. Jika diputus, garnisun, tungku, dan armada akan kelaparan bahan baku.',
    naval: 'Rute laut ini menentukan keseimbangan antara perdagangan resmi dan kekuasaan bajak laut. Satu blokade bisa mengubah harga pangan seluruh pulau.',
    warfront: 'Front ini adalah jalur benturan langsung antara kekuatan lapangan dan ancaman supernatural. Cocok untuk campaign perang terbuka.',
    contested: 'Wilayah sengketa ini cocok untuk penyergapan, perang kecil, dan diplomasi yang gagal di tengah kabut.',
    raid: 'Rute serbuan cepat. Sulit dipertahankan, mudah disangkal, dan sangat berbahaya bagi pelabuhan yang merasa aman.',
    secret: 'Jalur rahasia yang paling cocok untuk artefak, pengkhianat, mata-mata, dan tokoh yang ingin mengubah sejarah tanpa pasukan besar.',
  };
  return `${from?.name || 'Wilayah asal'} menuju ${to?.name || 'wilayah tujuan'}: ${base[route.type] || 'Jalur penting untuk konflik campaign.'}`;
}

function TerrainAtlasView(props) {
  return (
    <section className="card-section">
      <div className="hero-card green-panel">
        <h2>🗺️ Atlas Terrain Detail</h2>
        <p>
          Tampilan ini khusus terrain: parchment medieval, kontur ketinggian, hutan, rawa, vulkanik, steppe, reef,
          cursed land, sungai, gunung, arus laut, label jalan, dan route strategis. Hover titik wilayah untuk tooltip detail.
        </p>
        <div className="terrain-legend-grid">
          <span className="legend forest">Hutan</span><span className="legend swamp">Rawa</span><span className="legend volcano">Vulkanik</span>
          <span className="legend steppe">Steppe</span><span className="legend reef">Reef/Karang</span><span className="legend cursed">Cursed Land</span>
          <span className="legend river">Sungai</span><span className="legend mountain">Pegunungan</span><span className="legend route">Jalur Strategis</span>
        </div>
      </div>
      <MapView {...props} forceAllTerrain />
    </section>
  );
}

function CharactersView({ selectedFaction, setSelectedFaction, query, setQuery, scope, setScope, characters, onCharacter }) {
  const scopes = [
    ['all', 'Semua'],
    ['iconic', 'Ikonik'],
    ['support', 'Pendukung'],
    ['free', 'Bebas'],
    ['wanderer', 'Random / Pengembara'],
  ];

  return (
    <section className="card-section">
      <div className="hero-card compact">
        <h2>Direktori Karakter</h2>
        <p>Kamu bisa lihat semua karakter berdasarkan faksi, jenis, atau pencarian nama / cerita.</p>
        <div className="toolbar">
          <select value={selectedFaction} onChange={(e) => setSelectedFaction(e.target.value)}>
            <option value="all">Semua Faksi</option>
            {Object.values(FACTIONS).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, role, lokasi, konflik..." />
        </div>
        <div className="mode-switch small">
          {scopes.map(([id, label]) => (
            <button key={id} className={scope === id ? 'mode-btn active' : 'mode-btn'} onClick={() => setScope(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="character-grid bigger">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} onClick={() => onCharacter(character)} />
        ))}
      </div>
    </section>
  );
}

function MapView({ selectedFaction, allLocations, locationMap, selectedLocation, setSelectedLocation, setSelectedCharacter, forceAllTerrain = false }) {
  const [tooltip, setTooltip] = useState(null);
  const visible = forceAllTerrain || selectedFaction === 'all'
    ? allLocations
    : allLocations.filter((loc) => loc.faction === selectedFaction || (loc.faction === 'neutral' && loc.lockedFree));

  const routeVisible = (route) => {
    const from = locationMap.get(route.from);
    const to = locationMap.get(route.to);
    if (!from || !to) return false;
    return selectedFaction === 'all' || from.faction === selectedFaction || to.faction === selectedFaction || route.type === 'secret';
  };

  return (
    <section className="card-section map-only">
      <div className="hero-card compact">
        <h2>Peta Atlas Kaldera</h2>
        <p>
          Versi ini memakai tekstur atlas/medieval: kontur ketinggian, biome, sungai, gunung, hutan, pesisir,
          jalur dagang/militer, dan jalur strategis ala <b>Romance of Three Kingdoms</b> antar kastil, pelabuhan, benteng, dan wilayah penting.
        </p>
      </div>

      <div className="map-wrap atlas-wrap" onMouseLeave={() => setTooltip(null)}>
        {tooltip && (
          <div className="map-tooltip" style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}>
            <strong>{tooltip.loc.icon} {tooltip.loc.name}</strong>
            <span>{FACTIONS[tooltip.loc.faction]?.name || 'Wilayah Bebas'} · {tooltip.loc.type}</span>
            <p>{tooltip.loc.desc}</p>
            <small>Resource: {tooltip.loc.resources?.slice(0, 3).join(', ')}</small>
          </div>
        )}

        <svg viewBox="0 0 1200 900" className="kaldera-map atlas-map">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.25"/>
            </filter>
            <filter id="inkRough">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1"/>
            </filter>
            <pattern id="paperNoise" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="#eadab0"/>
              <circle cx="10" cy="20" r="1" fill="#c5b083" opacity="0.45"/>
              <circle cx="70" cy="34" r="1.2" fill="#c5b083" opacity="0.28"/>
              <circle cx="110" cy="94" r="1.4" fill="#b89f6d" opacity="0.25"/>
              <path d="M0 60 C25 54 44 67 60 60 C90 49 100 72 120 64" stroke="#ccb78f" strokeWidth="0.8" fill="none" opacity="0.35"/>
              <path d="M20 0 C35 34 24 60 42 120" stroke="#dcc896" strokeWidth="0.5" fill="none" opacity="0.22"/>
            </pattern>
            <pattern id="seaWaves" width="90" height="48" patternUnits="userSpaceOnUse">
              <rect width="90" height="48" fill="#7fa2ad"/>
              <path d="M0 12 C10 4 20 4 30 12 C40 20 50 20 60 12 C70 4 80 4 90 12" stroke="#c4dde3" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M0 32 C10 24 20 24 30 32 C40 40 50 40 60 32 C70 24 80 24 90 32" stroke="#c4dde3" strokeWidth="1.7" fill="none" opacity="0.45"/>
            </pattern>
            <pattern id="forestTexture" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="rgba(0,0,0,0)"/>
              <path d="M8 24 L13 11 L18 24 Z" fill="#49704d" opacity="0.5"/>
              <path d="M18 28 L23 15 L28 28 Z" fill="#3f6343" opacity="0.45"/>
            </pattern>
            <pattern id="reefTexture" width="54" height="54" patternUnits="userSpaceOnUse">
              <rect width="54" height="54" fill="rgba(0,0,0,0)"/>
              <circle cx="9" cy="12" r="2" fill="#2e7587" opacity="0.35"/>
              <circle cx="28" cy="32" r="2.4" fill="#2e7587" opacity="0.3"/>
              <path d="M3 44 C12 35 22 35 32 44 C42 53 48 47 54 42" stroke="#2e7587" strokeWidth="1" fill="none" opacity="0.4"/>
            </pattern>
            <pattern id="mountTexture" width="48" height="32" patternUnits="userSpaceOnUse">
              <path d="M8 28 L20 10 L32 28 Z" fill="#b09a78" opacity="0.45"/>
              <path d="M24 28 L34 14 L44 28 Z" fill="#9b8769" opacity="0.42"/>
            </pattern>
          </defs>

          <rect x="0" y="0" width="1200" height="900" fill="url(#seaWaves)" />
          <g opacity="0.35">
            <path d="M56 86 C138 52 210 52 294 86" className="sea-current"/>
            <path d="M850 86 C935 46 1035 68 1128 126" className="sea-current"/>
            <path d="M110 805 C232 760 316 792 440 820" className="sea-current"/>
            <path d="M780 828 C902 786 1008 792 1146 840" className="sea-current"/>
          </g>

          <path d="M120 140 C210 74 336 68 440 102 C522 62 672 52 778 87 C905 130 1020 234 1055 338 C1087 436 1068 589 980 692 C894 792 741 838 591 820 C479 842 342 825 242 760 C138 690 86 576 85 468 C84 363 51 228 120 140 Z" fill="url(#paperNoise)" stroke="#69573b" strokeWidth="7" filter="url(#shadow)"/>
          <path d="M128 145 C220 87 334 86 436 118 C532 80 673 74 780 110 C885 146 998 239 1032 338 C1062 425 1045 576 964 674 C885 769 738 810 594 794 C485 816 360 800 263 740 C168 681 120 575 117 470 C114 360 87 236 128 145 Z" fill="none" stroke="#f8efd3" strokeWidth="2" opacity="0.65"/>

          {CONTOURS.map((path, index) => <path key={`contour-${index}`} d={path} className="contour-line" />)}
          {BIOME_PATCHES.map((patch, index) => <path key={`biome-${index}`} d={patch.path} className={patch.cls} />)}

          {TERRITORIES.map((territory) => {
            const faction = FACTIONS[territory.id];
            return (
              <g key={territory.id} opacity={selectedFaction === 'all' || selectedFaction === territory.id || (selectedFaction === 'neutral' && territory.id === 'neutral') ? 1 : 0.52}>
                <path d={territory.path} fill={faction ? faction.color : '#6c7a86'} opacity="0.10" stroke={faction ? faction.color : '#6c7a86'} strokeWidth="3" strokeDasharray="12 5" filter="url(#inkRough)" />
                <text x={territory.labelX} y={territory.labelY} className="territory-label" fill={faction ? faction.color : '#555'}>{faction ? faction.name : territory.id}</text>
              </g>
            );
          })}

          {RIVERS.map((river, index) => <path key={index} d={river} className="river-line" />)}
          {MOUNTAINS.map(([x,y], index) => (
            <g key={`m-${index}`} className="mountain-symbol">
              <path d={`M${x} ${y+16} L${x+16} ${y-16} L${x+32} ${y+16} Z`} />
              <path d={`M${x+8} ${y+16} L${x+20} ${y-8} L${x+30} ${y+16} Z`} className="snow" />
            </g>
          ))}
          {FORESTS.map(([x,y], index) => (
            <g key={`f-${index}`} className="forest-symbol">
              <path d={`M${x} ${y+18} L${x+10} ${y} L${x+20} ${y+18} Z`} />
              <path d={`M${x+12} ${y+18} L${x+22} ${y+2} L${x+32} ${y+18} Z`} />
            </g>
          ))}

          {ROADS.map(([fromId, toId, roadName]) => {
            const from = locationMap.get(fromId);
            const to = locationMap.get(toId);
            if (!from || !to) return null;
            const midX = (from.x * 12 + to.x * 12) / 2;
            const midY = (from.y * 9 + to.y * 9) / 2;
            return (
              <g key={`${fromId}-${toId}`}>
                <line x1={from.x * 12} y1={from.y * 9} x2={to.x * 12} y2={to.y * 9} className="road-line" />
                <text x={midX} y={midY - 4} className="road-label">{roadName}</text>
              </g>
            );
          })}

          {FORTRESS_ROUTES.filter(routeVisible).map((route) => {
            const from = locationMap.get(route.from);
            const to = locationMap.get(route.to);
            if (!from || !to) return null;
            const x1 = from.x * 12;
            const y1 = from.y * 9;
            const x2 = to.x * 12;
            const y2 = to.y * 9;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 - 28;
            return (
              <g key={`${route.from}-${route.to}-${route.name}`} className={`fortress-route ${route.type}`}>
                <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} />
                <text x={cx} y={cy - 8}>{route.name}</text>
              </g>
            );
          })}

          {visible.map((loc) => {
            const faction = FACTIONS[loc.faction] || FACTIONS.neutral;
            const selected = selectedLocation?.id === loc.id;
            const px = loc.x * 12;
            const py = loc.y * 9;
            const isCastle = ['capital','fortress','stronghold'].includes(loc.type);
            return (
              <g
                key={loc.id}
                className="map-node"
                onClick={() => { setSelectedLocation(loc); setSelectedCharacter(null); }}
                onMouseMove={(event) => setTooltip({ loc, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY })}
                onMouseLeave={() => setTooltip(null)}
              >
                {isCastle ? (
                  <path d={`M${px-12} ${py+10} L${px-12} ${py-8} L${px-6} ${py-8} L${px-6} ${py-14} L${px+1} ${py-14} L${px+1} ${py-8} L${px+8} ${py-8} L${px+8} ${py-14} L${px+14} ${py-14} L${px+14} ${py+10} Z`} fill={loc.lockedFree ? '#324149' : faction.color} stroke={selected ? '#fff' : '#f4eedf'} strokeWidth={selected ? 4 : 2} />
                ) : (
                  <circle cx={px} cy={py} r={loc.mobile ? 10 : 8} fill={loc.lockedFree ? '#324149' : faction.color} stroke={selected ? '#fff' : '#f4eedf'} strokeWidth={selected ? 4 : 2} />
                )}
                <text x={px} y={py + 4} textAnchor="middle" fontSize="12" fill="#fff">{loc.icon}</text>
                <text x={px} y={py - 18} textAnchor="middle" className="map-label">{loc.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="route-ledger">
        <h3>Jalur Strategis ala Romance of Three Kingdoms</h3>
        <p className="muted">Setiap jalur menghubungkan kastil, benteng, pelabuhan, atau wilayah kunci. Cocok untuk simulasi invasi, diplomasi, suplai, dan perebutan chokepoint.</p>
        <div className="route-grid">
          {FORTRESS_ROUTES.map((route) => {
            const from = locationMap.get(route.from);
            const to = locationMap.get(route.to);
            return (
              <button key={route.name} className={`route-card ${route.type}`} onClick={() => from && setSelectedLocation(from)}>
                <strong>{route.name}</strong>
                <span>{from?.name} → {to?.name}</span>
                <small>{route.type}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CharacterCard({ character, onClick }) {
  const faction = FACTIONS[character.faction] || FACTIONS.neutral;
  return (
    <button className="character-card" onClick={onClick} style={{ borderTopColor: faction.color }}>
      <div className="character-card-head">
        <strong>{character.name}</strong>
        <span className={`kind-tag ${character.kind || 'support'}`}>{character.kind || 'support'}</span>
      </div>
      <small>{character.role}</small>
      <p>{character.bio}</p>
      <div className="pill-row">
        <span>{faction.name}</span>
        <span>{character.location}</span>
      </div>
    </button>
  );
}

function FactionDetail({ faction, characters, locations }) {
  return (
    <div>
      <h2>{faction.symbol} {faction.name}</h2>
      <p className="muted">{faction.desc}</p>
      <div className="detail-block"><strong>Trait</strong><p>{faction.trait}</p></div>
      <div className="detail-block"><strong>Sejarah Singkat</strong><p>{faction.history}</p></div>
      <div className="detail-block"><strong>Kekuatan</strong><p>{faction.power}</p></div>
      <div className="detail-block"><strong>Kelemahan</strong><p>{faction.weakness}</p></div>
      <div className="pill-row wrap">
        <span>{characters.filter((c) => c.kind === 'iconic').length} karakter ikonik</span>
        <span>{characters.length} total karakter</span>
        <span>{locations.length} wilayah tetap</span>
      </div>
    </div>
  );
}

function LocationDetail({ location, characters, onCharacter }) {
  const faction = FACTIONS[location.faction] || FACTIONS.neutral;
  return (
    <div>
      <h2>{location.icon} {location.name}</h2>
      <p className="muted"><b>Faksi:</b> <span style={{ color: faction.color }}>{faction.name}</span></p>
      <p className="muted"><b>Tipe:</b> {location.type} · <b>Populasi:</b> {(location.pop || 0).toLocaleString('id-ID')}</p>
      {location.mobile && <div className="notice">Tempat ini berpindah-pindah tiap turn.</div>}
      {location.lockedFree && <div className="notice blue">Wilayah ini tetap kosong dan bebas dari klaim permanen faksi mana pun.</div>}
      <div className="detail-block"><strong>Deskripsi Wilayah</strong><p>{location.desc}</p></div>
      <div className="detail-block"><strong>Lore Wilayah</strong><p>{location.lore}</p></div>
      <div className="detail-block"><strong>Sumber Daya</strong><div className="pill-row wrap">{location.resources.map((r) => <span key={r}>{r}</span>)}</div></div>
      <div className="detail-block"><strong>Karakter di Wilayah Ini</strong></div>
      <div className="simple-list">
        {characters.length === 0 ? <p className="muted">Belum ada karakter terdaftar di wilayah ini.</p> : characters.map((char) => (
          <button key={char.id} className="list-card" onClick={() => onCharacter(char)}>
            <div>
              <strong>{char.name}</strong>
              <small>{char.role}</small>
            </div>
            <span>{char.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function makeIconicExpansion(character, faction) {
  const force = character.stats ? Math.round((character.stats.perang + character.stats.intelek + character.stats.politik + character.stats.karisma) / 4) : 60;
  const conflictMap = {
    varath: 'tahta, darah, loyalitas militer, dan obsesi membakar dunia sebelum dunia membakar mereka lebih dulu',
    silven: 'sumpah lama, suara pohon, masa depan generasi muda, dan batas antara melindungi alam atau dikurung olehnya',
    azurra: 'uang, hukum dagang, rahasia pelabuhan, dan pertanyaan apakah republik masih punya jiwa di balik neraca',
    thornwall: 'darah bangsawan, hukum rune, kebohongan istana, dan rasa takut bahwa menara dibangun di atas mayat yang belum dikubur',
    ashkari: 'kehormatan klan, badai, garis darah, dan pilihan antara kebebasan nomad atau persatuan politik',
    pirate: 'kebebasan laut, hukum rampasan, dendam pada kerajaan pelabuhan, dan risiko berubah menjadi negara yang mereka benci',
    neutral: 'kelangsungan hidup, rahasia, harga informasi, dan kemampuan tetap bebas saat semua pihak menuntut pilihan',
  };
  const conflict = conflictMap[character.faction] || 'perebutan pengaruh, rahasia lama, dan pilihan moral yang makin sempit';
  return {
    psychology: `${character.name} bergerak karena kombinasi luka lama, ambisi pribadi, dan kebutuhan untuk tetap terlihat terkendali. Nilai rata-rata pengaruhnya sekitar ${force}, sehingga ia cukup kuat untuk mengubah satu front cerita bila diberi momentum yang tepat. Dalam adegan dialog, ia sebaiknya tidak hanya menjelaskan niat, tetapi selalu menyembunyikan satu lapis rasa takut atau perhitungan.`,
    longArc: `Arc panjang tokoh ini berputar pada ${conflict}. Awalnya ia terlihat sebagai bagian dari struktur faksi, tetapi semakin jauh cerita berjalan, ia menjadi titik tekan yang dapat membelokkan perang, aliansi, atau suksesi. Pilihan terbaik untuk menulisnya adalah memberi dua kemenangan kecil sebelum memaksa ia membayar satu harga besar.`,
    sceneHooks: [
      `Pertemuan rahasia di ${character.location} ketika kabar palsu membuatnya harus memilih antara harga diri dan keselamatan orang lain.`,
      `Satu surat, peta, atau saksi muncul dan menghubungkan rahasianya dengan tokoh dari faksi lain.`,
      `Ia menang dalam konflik publik, tetapi kemenangan itu membuka rahasia pribadi yang jauh lebih mahal.`,
      `Seorang karakter muda menjadikannya panutan, lalu kecewa saat melihat cara kotor yang ia pakai untuk bertahan.`
    ],
    possibleEndings: [
      'Menjadi penyelamat faksi, tetapi kehilangan orang yang membuatnya masih manusiawi.',
      'Mengkhianati faksinya demi kebenaran yang lebih besar, lalu dianggap monster oleh sejarah resmi.',
      'Menang secara politik namun kalah secara batin, cocok untuk ending tragis atau abu-abu.',
      'Membakar semua jembatan lama dan membuka jalur faksi baru pada akhir campaign.'
    ],
  };
}

function RelationGraph({ character }) {
  const faction = FACTIONS[character.faction] || FACTIONS.neutral;
  const relations = (character.connections || []).slice(0, 8);
  const nodes = relations.map((label, index) => {
    const angle = (-90 + index * (360 / Math.max(1, relations.length))) * Math.PI / 180;
    return {
      label,
      x: 180 + Math.cos(angle) * 122,
      y: 170 + Math.sin(angle) * 104,
    };
  });

  return (
    <div className="relation-graph-wrap">
      <svg viewBox="0 0 360 340" className="relation-graph">
        <defs>
          <filter id="nodeShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.22"/></filter>
        </defs>
        {nodes.map((node, index) => (
          <g key={node.label}>
            <line x1="180" y1="170" x2={node.x} y2={node.y} className="relation-line" />
            <circle cx={node.x} cy={node.y} r="28" fill="#f7ebc8" stroke={faction.color} strokeWidth="2" filter="url(#nodeShadow)" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" className="relation-index">{index + 1}</text>
          </g>
        ))}
        <circle cx="180" cy="170" r="44" fill={faction.color} stroke="#fff3d8" strokeWidth="4" filter="url(#nodeShadow)" />
        <text x="180" y="165" textAnchor="middle" className="relation-center">{character.name.split(' ')[0]}</text>
        <text x="180" y="184" textAnchor="middle" className="relation-center small">{faction.symbol} pusat</text>
      </svg>
      <ol className="relation-legend">
        {relations.length ? relations.map((rel) => <li key={rel}>{rel}</li>) : <li>Belum ada relasi eksplisit. Tambahkan connection di data karakter untuk memperkaya graph.</li>}
      </ol>
    </div>
  );
}

function CharacterDetail({ character }) {
  const faction = FACTIONS[character.faction] || FACTIONS.neutral;
  const isIconic = character.kind === 'iconic';
  const expansion = isIconic ? makeIconicExpansion(character, faction) : null;

  return (
    <div>
      <h2 style={{ color: faction.color }}>{character.name}</h2>
      <p className="muted"><b>{faction.name}</b> · {character.role}</p>
      <div className="pill-row wrap">
        <span>{character.kind || 'support'}</span>
        <span>{character.location}</span>
        <span>Umur {character.age}</span>
        {isIconic && <span>halaman ikonik lengkap</span>}
      </div>

      {isIconic && (
        <div className="iconic-banner" style={{ borderColor: faction.color }}>
          <strong>Tokoh Ikonik Utama</strong>
          <p>Panel ini dibuat lebih panjang: psikologi, arc panjang, rahasia, relasi graph, hook adegan, dan kemungkinan ending.</p>
        </div>
      )}

      <div className="detail-block"><strong>Biografi Utama</strong><p>{character.bio}</p></div>
      <div className="detail-block"><strong>Drama / Arc Saat Ini</strong><p>{character.drama}</p></div>
      <div className="detail-block secret-block"><strong>Rahasia Besar</strong><p>{character.secret}</p></div>

      {expansion && (
        <>
          <div className="detail-block"><strong>Psikologi Tokoh</strong><p>{expansion.psychology}</p></div>
          <div className="detail-block"><strong>Arc Panjang Campaign</strong><p>{expansion.longArc}</p></div>
          <div className="detail-block"><strong>Hook Adegan Khusus</strong><ul>{expansion.sceneHooks.map((hook) => <li key={hook}>{hook}</li>)}</ul></div>
          <div className="detail-block"><strong>Kemungkinan Ending</strong><ul>{expansion.possibleEndings.map((ending) => <li key={ending}>{ending}</li>)}</ul></div>
          <div className="detail-block"><strong>Graph Relasi Tokoh</strong><RelationGraph character={character} /></div>
        </>
      )}

      {character.connections?.length && !isIconic ? (
        <div className="detail-block"><strong>Relasi dan Kaitan Cerita</strong><ul>{character.connections.map((item) => <li key={item}>{item}</li>)}</ul></div>
      ) : null}
      {character.stats ? (
        <div className="detail-block"><strong>Stat</strong>
          <div className="stats-grid">
            {Object.entries(character.stats).map(([key, val]) => (
              <div key={key}><span>{key}</span><b>{val}</b></div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GeneralDetail({ combinedCharacters }) {
  return (
    <div>
      <h2>Panel Detail</h2>
      <p className="muted">Klik faksi untuk melihat list karakter faksi tersebut. Klik karakter untuk melihat detail cerita. Klik mode peta untuk melihat tekstur peta dan detail wilayah.</p>
      <div className="detail-block"><strong>Ringkas</strong></div>
      <div className="pill-row wrap">
        <span>{ICONIC_CHARACTERS.length} karakter ikonik</span>
        <span>{combinedCharacters.filter((c) => c.kind === 'wanderer').length} pengembara random</span>
        <span>{combinedCharacters.filter((c) => c.kind === 'free').length} karakter bebas</span>
      </div>
    </div>
  );
}

export default App;
