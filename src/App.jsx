import { useState, useEffect, useRef } from "react";

/* ─────────────────────── CONSTANTS ─────────────────────── */
const ENGAGEMENT_DATE = new Date("2026-07-26T18:00:00");

const C = {
  pearl: "#FAF8F5",
  blush: "#F2D7D9",
  blushSoft: "#F9ECED",
  lavender: "#C9B8DB",
  lavDeep: "#A78BBA",
  lavLight: "#E8DFF0",
  gold: "#C5A55A",
  goldLight: "#E8D9A8",
  rosegold: "#B76E79",
  dark: "#3A2D3F",
  muted: "#7A6B82",
  cream: "#FDF9F3",
};

/* ─────────────────────── GLOBAL STYLES ─────────────────────── */
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const s = document.createElement("style");
s.textContent = `
  @keyframes floatPetal {
    0% { transform: translateY(0) rotate(0deg) translateX(0); opacity:0; }
    10% { opacity:.65; }
    90% { opacity:.65; }
    100% { transform: translateY(100vh) rotate(360deg) translateX(70px); opacity:0; }
  }
  @keyframes gentlePulse {
    0%,100% { opacity:.6; transform:scale(1); }
    50% { opacity:1; transform:scale(1.06); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(44px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(.85); }
    to { opacity:1; transform:scale(1); }
  }
  @keyframes softGlow {
    0%,100% { box-shadow:0 0 24px rgba(169,139,186,.25); }
    50% { box-shadow:0 0 48px rgba(169,139,186,.5); }
  }
  @keyframes heartbeat {
    0%,100% { transform:scale(1); }
    14% { transform:scale(1.18); }
    28% { transform:scale(1); }
    42% { transform:scale(1.12); }
    56% { transform:scale(1); }
  }
  @keyframes starTwinkle {
    0%,100% { opacity:.25; transform:scale(.8); }
    50% { opacity:1; transform:scale(1.2); }
  }
  @keyframes musicBar {
    0%,100% { height:6px; }
    50% { height:22px; }
  }
  @keyframes shimmerGold {
    0% { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes floatSlow {
    0%,100% { transform:translateY(0); }
    50% { transform:translateY(-12px); }
  }

  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    font-family:'Montserrat',sans-serif;
    background:${C.pearl};
    color:${C.dark};
    overflow-x:hidden;
  }

  .reveal{
    opacity:0; transform:translateY(40px);
    transition: opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1);
  }
  .reveal.vis{ opacity:1; transform:translateY(0); }

  .glass{
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(22px);
    -webkit-backdrop-filter:blur(22px);
    border:1px solid rgba(255,255,255,.6);
    border-radius:24px;
    box-shadow:0 8px 32px rgba(169,139,186,.12), inset 0 1px 0 rgba(255,255,255,.8);
  }

  .fl-group{position:relative;}
  .fl-group input,.fl-group select,.fl-group textarea{
    width:100%;padding:20px 16px 8px;
    border:1.5px solid rgba(169,139,186,.28);border-radius:14px;
    background:rgba(255,255,255,.55);backdrop-filter:blur(10px);
    font-family:'Montserrat',sans-serif;font-size:15px;color:${C.dark};
    outline:none;transition:all .3s;
  }
  .fl-group input:focus,.fl-group select:focus,.fl-group textarea:focus{
    border-color:${C.lavDeep};box-shadow:0 0 0 4px rgba(169,139,186,.14);
  }
  .fl-group label{
    position:absolute;left:16px;top:50%;transform:translateY(-50%);
    font-size:15px;color:${C.muted};pointer-events:none;transition:all .25s;
  }
  .fl-group textarea~label{top:22px;}
  .fl-group input:focus~label,.fl-group input:not(:placeholder-shown)~label,
  .fl-group select:focus~label,.fl-group textarea:focus~label,
  .fl-group textarea:not(:placeholder-shown)~label{
    top:7px;transform:translateY(0);font-size:10.5px;color:${C.lavDeep};
    font-weight:600;letter-spacing:.6px;
  }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:${C.lavender};border-radius:3px;}

  @media(max-width:640px){
    .countdown-grid{gap:12px !important;}
    .countdown-unit-val{font-size:28px !important;}
    .event-grid{grid-template-columns:1fr !important;}
  }
`;
document.head.appendChild(s);

/* ─────────────────────── HOOKS ─────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => el.classList.add("vis"), delay); obs.unobserve(el); } },
      { threshold: .13, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

/* ─────────────────────── FLOATING PETALS ─────────────────────── */
const PETAL_ITEMS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 22,
  dur: 13 + Math.random() * 14,
  size: 7 + Math.random() * 15,
  kind: Math.random(),
  twinkleDur: 2 + Math.random() * 3,
}));

function Petals() {
  const items = PETAL_ITEMS;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {items.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: -30,
          width: p.size, height: p.size, opacity: 0,
          animation: `floatPetal ${p.dur}s ${p.delay}s infinite ease-in-out`,
        }}>
          {p.kind < 0.4 ? (
            <svg viewBox="0 0 24 24" fill={C.blush} style={{ width: "100%", height: "100%" }}>
              <path d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z" opacity=".55"/>
            </svg>
          ) : p.kind < 0.7 ? (
            <svg viewBox="0 0 24 24" fill={C.lavLight} style={{ width: "100%", height: "100%" }}>
              <path d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z" opacity=".5"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill={C.goldLight} style={{ width: "100%", height: "100%", animation: `starTwinkle ${p.twinkleDur}s infinite` }}>
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" opacity=".45"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── MUSIC BUTTON ─────────────────────── */
function MusicBtn({ audioRef }) {
  const [on, setOn] = useState(true);
  const toggle = () => {
    if (!audioRef.current) return;
    if (on) { audioRef.current.pause(); setOn(false); }
    else { audioRef.current.play().catch(() => {}); setOn(true); }
  };
  return (
    <button onClick={toggle} title={on ? "Pause" : "Play Music"} style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      width: 52, height: 52, borderRadius: "50%", border: "none",
      background: "rgba(255,255,255,.65)", backdropFilter: "blur(16px)",
      boxShadow: "0 4px 22px rgba(169,139,186,.3)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
      transition: "transform .3s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {on ? [0,1,2,3].map(i => (
        <div key={i} style={{ width: 3, borderRadius: 2, background: C.lavDeep, animation: `musicBar .55s ${i*.14}s infinite ease-in-out` }}/>
      )) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={C.lavDeep}>
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────── DECORATIVE RING SVG ─────────────────────── */
function RingDecor({ style }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: 60, height: 60, ...style }}>
      <circle cx="38" cy="50" r="22" stroke={C.gold} strokeWidth="2.5" opacity=".5"/>
      <circle cx="62" cy="50" r="22" stroke={C.rosegold} strokeWidth="2.5" opacity=".5"/>
    </svg>
  );
}

/* ─────────────────────── HERO SECTION ─────────────────────── */
function CountdownUnit({ val, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="countdown-unit-val" style={{
        fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,5.5vw,52px)",
        fontWeight: 600, color: "#fff", lineHeight: 1,
        textShadow: "0 2px 18px rgba(0,0,0,.3)",
      }}>{String(val).padStart(2, "0")}</div>
      <div style={{
        fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(8px,1.4vw,11px)",
        fontWeight: 600, color: "rgba(255,255,255,.78)", letterSpacing: 3,
        textTransform: "uppercase", marginTop: 5,
      }}>{label}</div>
    </div>
  );
}

function CountdownDot() {
  return (
    <div style={{ color: "rgba(255,255,255,.35)", fontFamily: "'Playfair Display',serif", fontSize: 32, alignSelf: "flex-start", marginTop: 2 }}>:</div>
  );
}

function Hero() {
  const cd = useCountdown(ENGAGEMENT_DATE);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const h = () => setOffset(window.scrollY * 0.35);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <section style={{
      position: "relative", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Parallax BG */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80')",
        backgroundSize: "cover", backgroundPosition: "center",
        transform: `translateY(${offset}px) scale(1.12)`,
        transition: "transform .08s linear",
      }}/>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(180deg, rgba(58,45,63,.48) 0%, rgba(169,139,186,.38) 50%, rgba(242,215,217,.32) 100%)",
      }}/>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        padding: "0 24px", animation: "fadeUp 1.4s ease",
      }}>
        {/* Ring ornament */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, animation: "floatSlow 5s infinite ease-in-out" }}>
          <RingDecor style={{ width: 72, height: 72, opacity: .8 }}/>
        </div>

        <div style={{
          fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(10px,1.6vw,13px)",
          fontWeight: 600, color: "rgba(255,255,255,.82)", letterSpacing: 7,
          textTransform: "uppercase", marginBottom: 18,
        }}>You Are Cordially Invited To The</div>

        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,4vw,36px)",
          fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,.92)",
          letterSpacing: 4, marginBottom: 10,
          background: `linear-gradient(90deg, ${C.goldLight}, #fff, ${C.goldLight})`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "shimmerGold 4s linear infinite",
        }}>Engagement Ceremony</div>

        <div style={{
          fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(10px,1.4vw,12px)",
          fontWeight: 500, color: "rgba(255,255,255,.7)", letterSpacing: 4, marginBottom: 28,
        }}>— OF —</div>

        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(46px,10vw,104px)", fontWeight: 500,
          color: "#fff", lineHeight: 1.05,
          textShadow: "0 4px 35px rgba(0,0,0,.28)",
        }}>
          Sanjay
          <span style={{
            display: "block", fontStyle: "italic", fontWeight: 400,
            fontSize: ".36em", opacity: .8, letterSpacing: 4, margin: "4px 0",
          }}>&</span>
          Shikha
        </h1>

        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(15px,2.2vw,20px)",
          fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,.88)",
          marginTop: 10, letterSpacing: 2,
        }}>July 26, 2026 · New Delhi, India</div>

        {/* Save The Date Badge */}
        <div style={{
          display: "inline-block", marginTop: 36, padding: "10px 32px",
          border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 50,
          fontFamily: "'Montserrat',sans-serif", fontSize: 10, fontWeight: 600,
          color: "rgba(255,255,255,.85)", letterSpacing: 5, textTransform: "uppercase",
          background: "rgba(255,255,255,.08)", backdropFilter: "blur(8px)",
        }}>Save The Date</div>

        {/* Countdown */}
        <div className="countdown-grid" style={{
          display: "flex", gap: "clamp(14px,3.5vw,36px)", justifyContent: "center",
          marginTop: 36, padding: "22px 28px", borderRadius: 20,
          background: "rgba(255,255,255,.1)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,.18)",
        }}>
          <CountdownUnit val={cd.d} label="Days"/>
          <CountdownDot/>
          <CountdownUnit val={cd.h} label="Hours"/>
          <CountdownDot/>
          <CountdownUnit val={cd.m} label="Min"/>
          <CountdownDot/>
          <CountdownUnit val={cd.s} label="Sec"/>
        </div>

        {/* Scroll hint */}
        <div style={{ marginTop: 52, animation: "gentlePulse 2.2s infinite" }}>
          <svg width="26" height="42" viewBox="0 0 28 44" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2">
            <rect x="1" y="1" width="26" height="42" rx="13"/>
            <circle cx="14" cy="14" r="3" fill="rgba(255,255,255,.65)">
              <animate attributeName="cy" values="14;26;14" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── VIDEO SECTION ─────────────────────── */
function VideoSection() {
  const r1 = useReveal();
  const r2 = useReveal(200);
  return (
    <section style={{
      padding: "100px 24px",
      background: `linear-gradient(180deg, ${C.pearl} 0%, ${C.lavLight}28 50%, ${C.pearl} 100%)`,
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div ref={r1} className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 10, animation: "heartbeat 3.5s infinite" }}>💍</div>
          <div style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: 5,
            textTransform: "uppercase", color: C.lavDeep, marginBottom: 10,
          }}>A Beautiful Beginning</div>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4.5vw,42px)",
            fontWeight: 500, color: C.dark,
          }}>The Ring Exchange</h2>
          <div style={{
            width: 50, height: 2, borderRadius: 1, margin: "14px auto 0",
            background: `linear-gradient(90deg, ${C.blush}, ${C.lavender})`,
          }}/>
        </div>

        <div ref={r2} className="reveal glass" style={{
          padding: 10, animation: "softGlow 5s infinite",
        }}>
          <video
            src="/Animation_Of_Ring_Exchange_Created.mp4"
            autoPlay loop muted playsInline
            style={{ width: "100%", borderRadius: 18, display: "block" }}
          />
          <p style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
            fontStyle: "italic", color: C.muted, textAlign: "center",
            marginTop: 14, paddingBottom: 6,
          }}>When two families became one ♡</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FAMILY BLESSINGS ─────────────────────── */
function FamilySection() {
  const r1 = useReveal();
  const r2 = useReveal(150);
  const r3 = useReveal(300);
  return (
    <section style={{
      padding: "100px 24px",
      background: `linear-gradient(180deg, ${C.pearl}, ${C.blushSoft}44, ${C.pearl})`,
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div ref={r1} className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: 5,
            textTransform: "uppercase", color: C.lavDeep, marginBottom: 10,
          }}>With The Blessings Of</div>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4.5vw,42px)",
            fontWeight: 500, color: C.dark,
          }}>Our Families</h2>
          <div style={{
            width: 50, height: 2, borderRadius: 1, margin: "14px auto 0",
            background: `linear-gradient(90deg, ${C.blush}, ${C.lavender})`,
          }}/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 32 }}>
          {[
            { side: "Groom's Family", parents: "Mr. & Mrs. Singh", desc: "With immense joy and blessings, we invite you to celebrate the engagement of our beloved son, Sanjay." },
            { side: "Bride's Family", parents: "Mr. & Mrs. Rai", desc: "It is our heartfelt pleasure to invite you to the engagement ceremony of our darling daughter, Shikha." },
          ].map((fam, i) => {
            const ref = i === 0 ? r2 : r3;
            return (
              <div key={i} ref={ref} className="reveal glass" style={{
                padding: "clamp(28px,4vw,40px)", textAlign: "center",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 4,
                  textTransform: "uppercase", color: C.lavDeep, marginBottom: 10,
                }}>{fam.side}</div>
                <div style={{
                  fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.8vw,26px)",
                  fontWeight: 500, color: C.dark, marginBottom: 14,
                }}>{fam.parents}</div>
                <p style={{
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
                  fontStyle: "italic", color: C.muted, lineHeight: 1.7,
                }}>{fam.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── EVENT CARD ─────────────────────── */
function EventCard({ ev, i }) {
  const ref = useReveal(i * 120);
  return (
    <div ref={ref} className="reveal glass" style={{ padding: "32px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{ev.icon}</div>
      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: "clamp(16px,2.5vw,20px)",
        fontWeight: 600, color: C.dark, marginBottom: 16,
      }}>{ev.label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted, fontSize: 14 }}>
          <span>📅</span><span>{ev.date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted, fontSize: 14 }}>
          <span>🕐</span><span>{ev.time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted, fontSize: 14 }}>
          <span>📍</span><span>{ev.venue}</span>
          
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── EVENT DETAILS ─────────────────────── */
function EventDetails() {
  const r1 = useReveal();
  const details = [
    { icon: "💎", label: "Engagement Ceremony", date: "July 26, 2026", time: "6:00 PM", venue: "The Gracious Banquets, Naraina" },
  ];
  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div ref={r1} className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: 5,
            textTransform: "uppercase", color: C.lavDeep, marginBottom: 10,
          }}>Celebrate With Us</div>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4.5vw,42px)",
            fontWeight: 500, color: C.dark,
          }}>Event Details</h2>
          <div style={{
            width: 50, height: 2, borderRadius: 1, margin: "14px auto 0",
            background: `linear-gradient(90deg, ${C.blush}, ${C.lavender})`,
          }}/>
        </div>

        <div className="event-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px),1fr))",
          gap: 28,
        }}>
          {details.map((ev, i) => <EventCard key={i} ev={ev} i={i}/>)}

          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.529234716717!2d77.14429187614427!3d28.64386818356467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03ba43e6a433%3A0xa4edfdcd4e7193b!2sThe%20Gracious%20Banquets%2C%20Naraina%2C%20Delhi!5e0!3m2!1sen!2sin!4v1777697978146!5m2!1sen!2sin" style={{ border: 0, width: "100%", height: "min(450px, 56vw)", minHeight: 240, borderRadius: 16 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────── FOOTER ─────────────────────── */
function Footer() {
  const ref = useReveal();
  return (
    <footer ref={ref} className="reveal" style={{
      padding: "72px 24px 36px", textAlign: "center",
      background: `linear-gradient(180deg, ${C.pearl}, ${C.lavLight}30)`,
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <RingDecor style={{ width: 52, height: 52, opacity: .6, animation: "floatSlow 6s infinite ease-in-out" }}/>
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,38px)",
        fontWeight: 500, color: C.dark, marginBottom: 6,
      }}>Sanjay & Shikha</h3>
      <p style={{
        fontFamily: "'Cormorant Garamond',serif", fontSize: 18,
        fontStyle: "italic", color: C.muted, marginBottom: 28,
      }}>Where two families unite in love & joy.</p>
      <div style={{ width: 50, height: 1, background: C.lavender, margin: "0 auto 20px" }}/>
      <p style={{ fontSize: 11.5, color: C.muted, fontWeight: 300, letterSpacing: 1 }}>
        Made with love · July 26, 2026
      </p>
    </footer>
  );
}

/* ─────────────────────── MAIN APP ─────────────────────── */
export default function EngagementInvitation() {
  const [entered, setEntered] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const a = new Audio("/kamhunt-smooth-ac-guitar-loop-93bpm-137706.mp3");
    a.loop = true; a.volume = 0.25;
    audioRef.current = a;
    return () => { a.pause(); a.src = ""; };
  }, []);

  const enter = () => {
    setEntered(true);
    audioRef.current?.play().catch(() => {});
  };

  if (!entered) return (
    <div onClick={enter} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: `linear-gradient(135deg, ${C.lavLight}, ${C.blushSoft})`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
    }}>
      <div style={{ animation: "heartbeat 2s infinite", fontSize: 52, marginBottom: 24 }}>💍</div>
      <h1 style={{
        fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,6vw,52px)",
        color: C.dark, marginBottom: 10, textAlign: "center",
      }}>Sanjay &amp; Shikha</h1>
      <p style={{
        fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(16px,2.5vw,22px)",
        fontStyle: "italic", color: C.muted, marginBottom: 40, textAlign: "center",
      }}>You&apos;re invited to our engagement</p>
      <div style={{
        padding: "14px 40px", borderRadius: 50,
        background: `linear-gradient(135deg, ${C.lavDeep}, ${C.rosegold})`,
        color: "#fff", fontFamily: "'Montserrat',sans-serif", fontSize: 14,
        fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
        boxShadow: "0 8px 28px rgba(169,139,186,.35)",
      }}>Tap to Enter</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.pearl }}>
      <Petals />
      <Hero />
      <VideoSection />
      <FamilySection />
      <EventDetails />
      <Footer />
      <MusicBtn audioRef={audioRef} />
    </div>
  );
}