import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const TARGET_RUPIAH = 6000;
const START_RUPIAH = 17830;
const START_HOUR = 8;
const SEASON_LENGTH = 7;

const dailyItems = [
  {
    id: "mie-ayam",
    name: "Mie Ayam",
    emoji: "🍜",
    basePrice: 15000,
    tag: "hangat",
    type: "food",
  },
  {
    id: "soto",
    name: "Soto",
    emoji: "🥣",
    basePrice: 18000,
    tag: "kuah aman",
    type: "food",
  },
  {
    id: "gorengan",
    name: "Gorengan",
    emoji: "🥟",
    basePrice: 2000,
    tag: "sensitif",
    type: "food",
  },
  {
    id: "kopi-susu",
    name: "Kopi Susu",
    emoji: "☕",
    basePrice: 22000,
    tag: "anti ngantuk",
    type: "food",
  },
  {
    id: "beras",
    name: "Beras",
    emoji: "🍚",
    basePrice: 75000,
    tag: "serius",
    type: "food",
  },
];

const gameItems = [
  {
    id: "game-cozy-farm",
    name: "Cozy Farm KW",
    emoji: "🌾",
    basePrice: 89000,
    tag: "-55%",
    type: "game",
  },
  {
    id: "game-balang-angkot",
    name: "Balap Angkot 2",
    emoji: "🚐",
    basePrice: 65000,
    tag: "-60%",
    type: "game",
  },
  {
    id: "game-horor-kos",
    name: "Horor Kos Jumat",
    emoji: "👻",
    basePrice: 45000,
    tag: "-50%",
    type: "game",
  },
  {
    id: "game-kerajaan-diskon",
    name: "Kerajaan Diskon",
    emoji: "🏰",
    basePrice: 120000,
    tag: "-70%",
    type: "game",
  },
];

const seasons = [
  {
    id: "tanggal-muda",
    name: "Musim Tanggal Muda",
    short: "Tanggal muda",
    emoji: "💸",
    notice:
      "Awal musim, dompet masih sok kuat. Steam KW ikut buka sale kecil-kecilan.",
  },
  {
    id: "diskon-game",
    name: "Musim Diskon Game",
    short: "Diskon game",
    emoji: "🎮",
    notice: "Musim baru datang. Harga game diskon, wishlist mulai berisik.",
  },
  {
    id: "harga-rewel",
    name: "Musim Harga Rewel",
    short: "Harga rewel",
    emoji: "📈",
    notice: "Awal musim harga rewel. Bu Tini pasang muka kalkulator.",
  },
  {
    id: "tanggal-tua",
    name: "Musim Tanggal Tua",
    short: "Tanggal tua",
    emoji: "🧾",
    notice: "Musim tanggal tua mulai. Belanja harus pakai mikir dua kali.",
  },
];

const achievements = [
  {
    id: "habebe-senang",
    title: "Habebe Senang",
    emoji: "🏆",
    description: "Kurs betah nongkrong di sekitar Rp6.000.",
  },
  {
    id: "kritikus-kantoran",
    title: "Kritikus Kantoran",
    emoji: "🧑‍💼",
    description: "Lempar opini 10 kali tanpa kehilangan gaya.",
  },
  {
    id: "mie-ayam-merakyat",
    title: "Mie Ayam Merakyat",
    emoji: "🍜",
    description: "Bungkus mie ayam saat harga masih sopan.",
  },
  {
    id: "dompet-selamat",
    title: "Dompet Selamat",
    emoji: "💰",
    description: "Saldo tembus Rp1.000.000. Dompet akhirnya napas.",
  },
  {
    id: "raja-gorengan",
    title: "Raja Gorengan",
    emoji: "🥟",
    description: "Sikat gorengan sebelum harganya ikut kuliah S2.",
  },
  {
    id: "kritik-panjang",
    title: "Esai Rakyat",
    emoji: "📝",
    description: "Nulis ocehan minimal 80 karakter. Niat juga, ya.",
  },
  {
    id: "wishlist-keangkut",
    title: "Wishlist Keangkut",
    emoji: "🎮",
    description: "Beli game pas Steam KW lagi diskon.",
  },
];

const randomEvents = [
  {
    text: "Grup kantor ribut bahas kurs. Grafik ikut kebawa suasana.",
    change: 330,
    mood: -4,
  },
  {
    text: "Ada kabar adem dari pasar. Rupiah mulai duduk manis.",
    change: -280,
    mood: 5,
  },
  {
    text: "Harga bahan pokok naik tipis. Bu Tini langsung pegang kalkulator.",
    change: 430,
    mood: -6,
  },
  {
    text: "Ocehan warga viral kecil-kecilan. Kurs jadi agak nurut.",
    change: -310,
    mood: 4,
  },
  {
    text: "Investor baca headline doang, lalu panik sendiri.",
    change: 370,
    mood: -5,
  },
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatGameTime(day, hour) {
  return `H${day} ${formatHour(hour)}`;
}

function getSeason(day) {
  const index = Math.floor((day - 1) / SEASON_LENGTH) % seasons.length;
  return seasons[index];
}

function isSeasonStart(day) {
  return day > 1 && (day - 1) % SEASON_LENGTH === 0;
}

function isSaleWindow(day) {
  return (day - 1) % SEASON_LENGTH <= 1;
}

function getInitialHistory() {
  return [
    { time: "H1 03:00", rupiah: START_RUPIAH + 260 },
    { time: "H1 04:00", rupiah: START_RUPIAH + 120 },
    { time: "H1 05:00", rupiah: START_RUPIAH + 360 },
    { time: "H1 06:00", rupiah: START_RUPIAH - 90 },
    { time: "H1 07:00", rupiah: START_RUPIAH + 170 },
    { time: "H1 08:00", rupiah: START_RUPIAH },
  ];
}

export default function App() {
  const timeRef = useRef({ day: 1, hour: START_HOUR });
  const rupiahRef = useRef(START_RUPIAH);

  const [rupiah, setRupiah] = useState(START_RUPIAH);
  const [money, setMoney] = useState(350000);
  const [energy, setEnergy] = useState(85);
  const [mood, setMood] = useState(70);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(START_HOUR);
  const [kritikCount, setKritikCount] = useState(0);
  const [critiqueText, setCritiqueText] = useState("");
  const [intelRisk, setIntelRisk] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [seasonNotice, setSeasonNotice] = useState(null);
  const [longCritiqueSent, setLongCritiqueSent] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stableTicks, setStableTicks] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [logs, setLogs] = useState([
    "Shift dimulai. Kurs lagi di kisaran dunia nyata, jadi dompet langsung mikir.",
    "Pantau jam, kurs, dan sale musiman. Jangan sampai wishlist menang banyak tapi makan kalah.",
  ]);
  const [history, setHistory] = useState(getInitialHistory);

  const currentSeason = useMemo(() => getSeason(day), [day]);
  const saleActive = useMemo(() => isSaleWindow(day), [day]);
  const storeItems = useMemo(
    () => (saleActive ? gameItems : dailyItems),
    [saleActive],
  );

  const priceMultiplier = useMemo(() => {
    return clamp(rupiah / TARGET_RUPIAH, 0.7, 3.5);
  }, [rupiah]);

  const rupiahStatus = useMemo(() => {
    if (rupiah >= 5900 && rupiah <= 6100) return "lagi anteng";
    if (rupiah < 9000) return "terlalu gacor";
    if (rupiah <= 12000) return "mulai rapi";
    if (rupiah <= 16000) return "lumayan goyah";
    if (rupiah <= 19000) return "mulai ngos-ngosan";
    return "bikin dompet sesak";
  }, [rupiah]);

  const moodLabel = useMemo(() => {
    if (mood >= 80) return "warga senyum";
    if (mood >= 60) return "aman terkendali";
    if (mood >= 35) return "mulai manyun";
    return "warung hening";
  }, [mood]);

  const riskLabel = useMemo(() => {
    if (intelRisk >= 85) return "bahaya, pelan-pelan";
    if (intelRisk >= 60) return "mulai dilirik";
    if (intelRisk >= 30) return "ada yang mantau";
    return "masih adem";
  }, [intelRisk]);

  const addLog = useCallback((message) => {
    setLogs((prev) => [message, ...prev].slice(0, 9));
  }, []);

  const addHistory = useCallback((nextValue, label) => {
    setHistory((prev) => [
      ...prev.slice(-24),
      {
        time: label,
        rupiah: nextValue,
      },
    ]);
  }, []);

  const updateRupiah = useCallback(
    (
      change,
      label = formatGameTime(timeRef.current.day, timeRef.current.hour),
    ) => {
      const next = clamp(rupiahRef.current + change, 5000, 22000);

      rupiahRef.current = next;
      setRupiah(next);
      addHistory(next, label);

      if (next >= 5900 && next <= 6100) {
        setStableTicks((prev) => prev + 1);
      } else {
        setStableTicks(0);
      }
    },
    [addHistory],
  );

  const showSeasonNotice = useCallback(
    (season, nextDay) => {
      setSeasonNotice({
        emoji: season.emoji,
        title: season.name,
        text: season.notice,
      });

      addLog(`Hari ${nextDay}: ${season.notice}`);
    },
    [addLog],
  );

  const triggerDayEvent = useCallback(
    (nextDay) => {
      if (isSeasonStart(nextDay)) {
        showSeasonNotice(getSeason(nextDay), nextDay);
      }

      if (nextDay % 7 === 0) {
        const bonus = 350000;

        setMoney((prev) => prev + bonus);
        setMood((prev) => clamp(prev + 8, 0, 100));
        addLog(
          `Hari ${nextDay}: gajian kecil cair. Dompet +${formatRupiah(bonus)}.`,
        );
        return;
      }

      if (nextDay % 5 === 0) {
        updateRupiah(650, formatGameTime(nextDay, 9));
        setMood((prev) => clamp(prev - 7, 0, 100));
        addLog(
          `Hari ${nextDay}: harga bahan pokok ngangkat alis. Kurs ikut rewel.`,
        );
        return;
      }

      if (nextDay % 3 === 0) {
        setEnergy((prev) => clamp(prev - 8, 0, 100));
        addLog(
          `Hari ${nextDay}: meeting dadakan. Stamina kepotong tanpa persetujuan.`,
        );
      }
    },
    [addLog, showSeasonNotice, updateRupiah],
  );

  const advanceTime = useCallback(
    (hours) => {
      const current = timeRef.current;
      const totalHours = current.hour + hours;
      const nextDay = current.day + Math.floor(totalHours / 24);
      const nextHour = totalHours % 24;

      for (let newDay = current.day + 1; newDay <= nextDay; newDay += 1) {
        triggerDayEvent(newDay);
      }

      timeRef.current = { day: nextDay, hour: nextHour };
      setDay(nextDay);
      setHour(nextHour);

      return { day: nextDay, hour: nextHour };
    },
    [triggerDayEvent],
  );

  function handleKritik() {
    const cleanText = critiqueText.trim();

    if (gameOver) return;

    if (energy < 12) {
      addLog("Stamina habis. Mau ngetik aja rasanya kayak lembur akhir bulan.");
      return;
    }

    if (cleanText.length < 8) {
      addLog("Ocehannya kependekan. Bahkan grup RT belum sempat panas.");
      return;
    }

    const effect = clamp(Math.floor(cleanText.length * 6), 150, 760);
    const riskIncrease = cleanText.length >= 80 ? 14 : 9;
    const nextTime = advanceTime(1);

    setEnergy((prev) => clamp(prev - 12, 0, 100));
    setMood((prev) => clamp(prev + 5, 0, 100));
    setKritikCount((prev) => prev + 1);
    setIntelRisk((prev) => clamp(prev + riskIncrease, 0, 100));

    if (cleanText.length >= 80) {
      setLongCritiqueSent(true);
    }

    updateRupiah(-effect, formatGameTime(nextTime.day, nextTime.hour));

    addLog(
      `Ocehan meluncur: "${cleanText.slice(0, 42)}${
        cleanText.length > 42 ? "..." : ""
      }"`,
    );
    addLog(`Kurs turun ${effect} poin. Radar intel ikut naik ${riskIncrease}.`);

    setCritiqueText("");
  }

  function handleWork() {
    if (gameOver) return;

    if (energy < 15) {
      addLog("Kamu udah tepar. Buka spreadsheet aja rasanya pengen logout.");
      return;
    }

    const nextTime = advanceTime(4);
    const salary = Math.floor(Math.random() * 70000) + 80000;

    setMoney((prev) => prev + salary);
    setEnergy((prev) => clamp(prev - 15, 0, 100));
    setMood((prev) => clamp(prev - 3, 0, 100));

    addLog(
      `${formatGameTime(nextTime.day, nextTime.hour)}: ngantor dulu. Dompet nambah ${formatRupiah(salary)}.`,
    );
  }

  function handleRest() {
    if (gameOver) return;

    const nextTime = advanceTime(8);

    setEnergy((prev) => clamp(prev + 28, 0, 100));
    setMood((prev) => clamp(prev + 2, 0, 100));
    setIntelRisk((prev) => clamp(prev - 8, 0, 100));

    addLog(
      `${formatGameTime(nextTime.day, nextTime.hour)}: power nap dulu. Stamina naik, radar intel agak lupa arah.`,
    );
  }

  function getFinalPrice(item) {
    const saleDiscount = item.type === "game" ? 0.45 : 1;
    return Math.round(item.basePrice * priceMultiplier * saleDiscount);
  }

  function buyItem(item) {
    if (gameOver) return;

    const finalPrice = getFinalPrice(item);
    const alreadyOwned = item.type === "game" && inventory.includes(item.id);

    if (alreadyOwned) {
      addLog(
        `${item.name} sudah ada di library. Tenang, nggak usah beli dobel.`,
      );
      return;
    }

    if (!saleActive && item.type !== "game" && rupiah > 20000) {
      addLog(
        `${item.name} lagi mahal banget. Dompet langsung pura-pura offline.`,
      );
      return;
    }

    if (money < finalPrice) {
      addLog(`Belum cukup buat ${item.name}. Dompet bilang: nanti dulu, bos.`);
      return;
    }

    const nextTime = advanceTime(item.type === "game" ? 2 : 1);

    setMoney((prev) => prev - finalPrice);
    setInventory((prev) => [...prev, item.id]);
    setMood((prev) => clamp(prev + (item.type === "game" ? 7 : 4), 0, 100));

    if (item.type === "game") {
      addLog(
        `${formatGameTime(nextTime.day, nextTime.hour)}: ${item.name} masuk library. Wishlist aman, dompet menipis ${formatRupiah(finalPrice)}.`,
      );
      return;
    }

    addLog(
      `${formatGameTime(nextTime.day, nextTime.hour)}: ${item.name} berhasil dibungkus. Dompet kepotong ${formatRupiah(finalPrice)}.`,
    );
  }

  function resetGame() {
    timeRef.current = { day: 1, hour: START_HOUR };
    rupiahRef.current = START_RUPIAH;

    setRupiah(START_RUPIAH);
    setMoney(350000);
    setEnergy(85);
    setMood(70);
    setDay(1);
    setHour(START_HOUR);
    setKritikCount(0);
    setCritiqueText("");
    setIntelRisk(0);
    setCelebration(null);
    setSeasonNotice(null);
    setLongCritiqueSent(false);
    setGameOver(false);
    setStableTicks(0);
    setInventory([]);
    setUnlocked([]);
    setHistory(getInitialHistory());
    setLogs([
      "Game diulang. Kurs balik ke kisaran dunia nyata.",
      "Kali ini coba jaga jam, kurs, dan wishlist dengan lebih elegan.",
    ]);
  }

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const nextTime = advanceTime(1);
      const event =
        randomEvents[Math.floor(Math.random() * randomEvents.length)];

      updateRupiah(event.change, formatGameTime(nextTime.day, nextTime.hour));
      setMood((prev) => clamp(prev + event.mood, 0, 100));
      addLog(`${formatGameTime(nextTime.day, nextTime.hour)}: ${event.text}`);
    }, 4500);

    return () => clearInterval(interval);
  }, [gameOver, advanceTime, updateRupiah, addLog]);

  useEffect(() => {
    const newlyUnlocked = [];

    if (stableTicks >= 5 && !unlocked.includes("habebe-senang")) {
      newlyUnlocked.push("habebe-senang");
    }

    if (kritikCount >= 10 && !unlocked.includes("kritikus-kantoran")) {
      newlyUnlocked.push("kritikus-kantoran");
    }

    if (
      inventory.includes("mie-ayam") &&
      !unlocked.includes("mie-ayam-merakyat")
    ) {
      newlyUnlocked.push("mie-ayam-merakyat");
    }

    if (inventory.includes("gorengan") && !unlocked.includes("raja-gorengan")) {
      newlyUnlocked.push("raja-gorengan");
    }

    if (
      inventory.some((itemId) => itemId.startsWith("game-")) &&
      !unlocked.includes("wishlist-keangkut")
    ) {
      newlyUnlocked.push("wishlist-keangkut");
    }

    if (longCritiqueSent && !unlocked.includes("kritik-panjang")) {
      newlyUnlocked.push("kritik-panjang");
    }

    if (money >= 1000000 && !unlocked.includes("dompet-selamat")) {
      newlyUnlocked.push("dompet-selamat");
    }

    if (newlyUnlocked.length === 0) return;

    const timeout = setTimeout(() => {
      const validAchievements = newlyUnlocked
        .map((id) => achievements.find((item) => item.id === id))
        .filter(Boolean);

      setUnlocked((prev) => {
        const filteredAchievements = newlyUnlocked.filter(
          (id) => !prev.includes(id),
        );

        return [...prev, ...filteredAchievements];
      });

      validAchievements.forEach((achievement) => {
        addLog(`Lencana kebuka: ${achievement.emoji} ${achievement.title}.`);
      });

      setCelebration(validAchievements[0]);
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    stableTicks,
    kritikCount,
    inventory,
    money,
    unlocked,
    longCritiqueSent,
    addLog,
  ]);

  useEffect(() => {
    if (!celebration) return;

    const timeout = setTimeout(() => {
      setCelebration(null);
    }, 3200);

    return () => clearTimeout(timeout);
  }, [celebration]);

  useEffect(() => {
    if (!seasonNotice) return;

    const timeout = setTimeout(() => {
      setSeasonNotice(null);
    }, 4200);

    return () => clearTimeout(timeout);
  }, [seasonNotice]);

  useEffect(() => {
    if (intelRisk < 100 || gameOver) return;

    const timeout = setTimeout(() => {
      setGameOver(true);
      addLog("Radar intel full. Kamu kena sambang buat ngobrol serius dulu.");
    }, 0);

    return () => clearTimeout(timeout);
  }, [intelRisk, gameOver, addLog]);

  return (
    <main className="game-page">
      {celebration && (
        <div className="celebration-overlay">
          <div className="confetti confetti-1" />
          <div className="confetti confetti-2" />
          <div className="confetti confetti-3" />
          <div className="confetti confetti-4" />
          <div className="confetti confetti-5" />
          <div className="confetti confetti-6" />

          <div className="celebration-card">
            <span className="celebration-emoji">{celebration.emoji}</span>
            <p>Yeay, kebuka!</p>
            <h2>{celebration.title}</h2>
            <small>{celebration.description}</small>
          </div>
        </div>
      )}

      {seasonNotice && (
        <div className="season-toast">
          <span>{seasonNotice.emoji}</span>
          <div>
            <strong>{seasonNotice.title}</strong>
            <p>{seasonNotice.text}</p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <span>🕵️‍♂️</span>
            <p className="modal-kicker">radar kebanyakan nyala</p>
            <h2>Kena Sambang Dulu</h2>
            <p>
              Kamu terlalu rajin lempar opini sampai ada yang kepo. Kurs boleh
              mulai jinak, tapi kamu keburu diajak ngobrol duluan.
            </p>

            <button onClick={resetGame}>Coba lagi</button>
          </div>
        </div>
      )}

      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">simulasi</p>
          <h1>Rupiah Turun</h1>
          <p className="subtitle">
            Pagi absen, siang mantau kurs, sore mikir harga gorengan. Bikin
            rupiah nggak terlalu drama, pantau jam, terus serbu sale musiman
            sebelum wishlist balik mahal.
          </p>

          <div className="chip-row">
            <span>📉 kurs turun</span>
            <span>🎮 awal musim suka diskon</span>
            <span>🕵️ jangan berisik amat</span>
          </div>
        </div>

        <div className={`rupiah-badge ${rupiahStatus.replaceAll(" ", "-")}`}>
          <span className="badge-sticker">kurs hari ini</span>
          <p>Kurs sekarang</p>
          <strong>{formatRupiah(rupiah)}</strong>
          <small>Rasanya: {rupiahStatus}</small>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon">💵</span>
          <div>
            <p>Isi dompet</p>
            <strong>{formatRupiah(money)}</strong>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">⚡</span>
          <div>
            <p>Stamina</p>
            <strong>{energy}/100</strong>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">🙂</span>
          <div>
            <p>Vibes warga</p>
            <strong>{mood}/100</strong>
            <small>{moodLabel}</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon danger">🕵️</span>
          <div>
            <p>Radar intel</p>
            <strong>{intelRisk}/100</strong>
            <small>{riskLabel}</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">{currentSeason.emoji}</span>
          <div>
            <p>Musim</p>
            <strong>{currentSeason.short}</strong>
            <small>{saleActive ? "sale nyala" : "warung biasa"}</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon">🕒</span>
          <div>
            <p>Waktu</p>
            <strong>Hari {day}</strong>
            <small>{formatHour(hour)}</small>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-header chart-header">
            <div>
              <p className="eyebrow">pantauan kurs</p>
              <h2>Rupiah lagi ngapain?</h2>
            </div>
            <span className="target-pill">mimpi indah: 6 ribu</span>
          </div>

          <div className="chart-live-row">
            <div className="chart-live-main">
              <span>Kurs sekarang</span>
              <strong>{formatRupiah(rupiah)}</strong>
            </div>

            <div>
              <span>Waktu</span>
              <strong>{formatGameTime(day, hour)}</strong>
            </div>

            <div>
              <span>Rasanya</span>
              <strong>{rupiahStatus}</strong>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={history}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="rupiahGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis
                  domain={[5000, 22000]}
                  tickFormatter={(value) => `${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Area
                  type="monotone"
                  dataKey="rupiah"
                  stroke="#147a3a"
                  strokeWidth={3}
                  fill="url(#rupiahGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel action-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Bacotin sini</p>
              <h2>Ketik kan Suaramu</h2>
            </div>
          </div>

          <div className="critique-box">
            <textarea
              value={critiqueText}
              onChange={(event) => setCritiqueText(event.target.value)}
              placeholder="Contoh: Bahlil goblin"
              disabled={gameOver}
            />

            <div className="risk-bar" aria-label="Radar intel">
              <span style={{ width: `${intelRisk}%` }} />
            </div>

            <button onClick={handleKritik} disabled={gameOver}>
              Kirim Kritik
            </button>

            <small>
              Opini makan 1 jam. Ngantor makan 4 jam. Power nap makan 8 jam.
              Jadi waktu jalan terus, nggak patah cuma karena ganti hari.
            </small>
          </div>

          <div className="actions">
            <button onClick={handleWork} disabled={gameOver}>
              Kerja bang
            </button>
            <button onClick={handleRest} disabled={gameOver}>
              Tido
            </button>
          </div>
        </article>

        <article
          className={`panel shop-panel ${saleActive ? "sale-mode" : ""}`}
        >
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                {saleActive ? "steam kw sale" : "warung bu tini"}
              </p>
              <h2>
                {saleActive ? "Wishlist lagi diskon" : "Sikat sebelum naik"}
              </h2>
            </div>
            {saleActive && (
              <span className="target-pill sale-pill">awal musim</span>
            )}
          </div>

          <div className="shop-list">
            {storeItems.map((item) => {
              const finalPrice = getFinalPrice(item);
              const isOwned = inventory.includes(item.id);

              return (
                <button
                  className={`shop-item ${item.type === "game" ? "game-item" : ""}`}
                  key={item.id}
                  onClick={() => buyItem(item)}
                  disabled={gameOver}
                >
                  <span className="item-emoji">{item.emoji}</span>

                  <span>
                    <strong>{item.name}</strong>
                    <small>{formatRupiah(finalPrice)}</small>
                  </span>

                  <em>
                    {isOwned
                      ? item.type === "game"
                        ? "library"
                        : "pernah beli"
                      : item.tag}
                  </em>
                </button>
              );
            })}
          </div>
        </article>

        <article className="panel achievement-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Kumpulkan</p>
              <h2>Achievement</h2>
            </div>
          </div>

          <div className="achievement-list">
            {achievements.map((achievement) => {
              const isUnlocked = unlocked.includes(achievement.id);

              return (
                <div
                  className={`achievement-card ${isUnlocked ? "unlocked" : ""}`}
                  key={achievement.id}
                >
                  <span>{achievement.emoji}</span>

                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                  </div>

                  <small>{isUnlocked ? "kebuka" : "locked"}</small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel log-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">berita hari ini</p>
              <h2>Apa yang lagi rame?</h2>
            </div>
          </div>

          <div className="log-list">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`}>{log}</p>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
