import { LOCATIONS } from '../data/locations.js';

const RANDOM_PLACE_NAMES = [
  'Pasar Kabut Berjalan',
  'Perkemahan Pemburu Artefak',
  'Perpustakaan Roda',
  'Kedai Tiga Bayangan',
  'Karavan Obat Keliling',
  'Arena Duel Nomad',
  'Paviliun Peta Palsu',
  'Kuil Kain Merah',
  'Makam Berpindah',
  'Pos Kurir Bayangan',
  'Rumah Judi Pasang-Surut',
  'Kafilah Tulang Putih',
];

const WANDERER_NAMES = [
  'Asha Greyveil',
  'Miro Dustlane',
  'Kala Reed',
  'Otho Bellscar',
  'Jovin Mapburn',
  'Sali Moonless',
  'Nix Blueknife',
  'Runa Emberstep',
  'Daro Fernlock',
  'Vera No-Flag',
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createRandomPlaces() {
  return RANDOM_PLACE_NAMES.map((name, index) => {
    const stayTurns = 1 + Math.floor(Math.random() * 4);
    return {
      id: `random-place-${index + 1}`,
      name,
      faction: 'neutral',
      mobile: true,
      stayTurns,
      remainingTurns: stayTurns,
      x: rand(18, 82),
      y: rand(20, 78),
      icon: index % 3 === 0 ? '◆' : index % 3 === 1 ? '◇' : '✦',
      type: 'mobile',
      pop: Math.floor(rand(40, 850)),
      resources: ['Rumor', 'Informasi', 'Barang Aneh'],
      tags: ['random', 'berpindah', 'netral'],
      desc: `${name} adalah lokasi netral yang dapat muncul hanya satu turn atau bertahan beberapa turn sebelum berpindah ke wilayah lain.`,
      lore: 'Para pengelana percaya tempat-tempat ini muncul saat dunia sedang menahan napas.',
    };
  });
}

export function advanceRandomPlaces(randomPlaces) {
  return randomPlaces.map((place) => {
    const remainingTurns = place.remainingTurns - 1;
    if (remainingTurns > 0) return { ...place, remainingTurns };

    const stayTurns = 1 + Math.floor(Math.random() * 4);
    return {
      ...place,
      x: rand(18, 82),
      y: rand(20, 78),
      stayTurns,
      remainingTurns: stayTurns,
    };
  });
}

const STATIC_LOCATION_IDS = LOCATIONS.filter((loc) => !loc.lockedFree).map((loc) => loc.id);
const ROLES = ['Petualang Bebas', 'Pemburu Artefak', 'Mata-Mata Tanpa Bendera', 'Kurir Gelap', 'Pengumpul Gosip'];

export function createWanderers() {
  return WANDERER_NAMES.map((name, index) => ({
    id: `wanderer-${index + 1}`,
    name,
    faction: 'neutral',
    kind: 'wanderer',
    role: choice(ROLES),
    age: 21 + (index * 4),
    currentLocationId: choice(STATIC_LOCATION_IDS),
    traits: index % 2 === 0 ? ['Netral', 'Berpindah', 'Sulit Ditangkap'] : ['Lincah', 'Banyak Kabar', 'Tidak Bisa Dipercaya'],
    bio: `${name} adalah pengembara tanpa panji yang hidup dari jalan, utang kecil, dan rahasia yang dijual pada orang yang tepat.`,
    drama: 'Jejaknya sering muncul sebelum peristiwa besar terjadi, seolah mereka selalu tahu ke mana arus sejarah bergerak.',
    secret: 'Memegang satu peta atau nama yang nilainya cukup untuk memulai perang baru.',
    connections: ['Sering terlihat di Celah Angin', 'Pernah menjual rumor ke sedikitnya dua faksi besar'],
  }));
}

export function advanceWanderers(wanderers) {
  return wanderers.map((w) => ({
    ...w,
    currentLocationId: choice(STATIC_LOCATION_IDS),
  }));
}
