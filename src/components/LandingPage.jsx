// =====================================================
// LandingPage.jsx — Page d'accueil publique
// =====================================================

function LandingPage({ onLogin }) {
  const features = [
    {
      icon: "📋",
      title: "Gestion de tâches",
      desc: "Créez, assignez et suivez vos tâches avec priorités, dates d'échéance et sous-tâches.",
    },
    {
      icon: "🎯",
      title: "Vue Kanban",
      desc: "Organisez votre travail en colonnes drag & drop. Visualisez l'avancement en un coup d'œil.",
    },
    {
      icon: "📊",
      title: "Statistiques avancées",
      desc: "Graphiques en temps réel, taux de complétion, productivité par membre.",
    },
    {
      icon: "👥",
      title: "Travail en équipe",
      desc: "Invitez des membres, assignez des tâches et collaborez en temps réel.",
    },
    {
      icon: "🤖",
      title: "Assistant IA",
      desc: "Générez des tâches automatiquement et obtenez des recommandations intelligentes.",
    },
    {
      icon: "📅",
      title: "Vues multiples",
      desc: "Kanban, Liste, Calendrier, Gantt — choisissez la vue qui vous convient.",
    },
    {
      icon: "📎",
      title: "Fichiers joints",
      desc: "Attachez des fichiers directement sur vos tâches. PDF, images, documents.",
    },
    {
      icon: "📄",
      title: "Export PDF & Excel",
      desc: "Générez des rapports professionnels exportables en un clic.",
    },
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "pour toujours",
      color: "#639922",
      features: [
        "3 projets maximum",
        "10 tâches par projet",
        "1 membre par projet",
        "Export PDF",
        "Vues Kanban et Liste",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "9€",
      period: "par mois",
      color: "#9B7FD4",
      features: [
        "Projets illimités",
        "Tâches illimitées",
        "5 membres par projet",
        "Assistant IA",
        "Toutes les vues",
        "Export PDF & Excel",
        "Fichiers joints",
        "Intégration GitHub",
      ],
      cta: "Commencer l'essai gratuit",
      highlighted: true,
    },
    {
      name: "Entreprise",
      price: "29€",
      period: "par mois",
      color: "#9B59B6",
      features: [
        "Tout du plan Pro",
        "Membres illimités",
        "Support prioritaire",
        "API publique",
        "Dashboard Admin",
        "Personnalisation",
        "SSO / SAML",
      ],
      cta: "Contacter les ventes",
      highlighted: false,
    },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", color: "#222", overflowX: "hidden" }}>
      {/* ---- NAVBAR ---- */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 2rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}>📊 Project Manager</div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="#features" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>
            Fonctionnalités
          </a>
          <a href="#pricing" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>
            Tarifs
          </a>
          <button
            onClick={onLogin}
            style={{
              fontSize: "13px",
              padding: "8px 20px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Se connecter
          </button>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #111 0%, #333 50%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "6rem 2rem 4rem",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "20px",
            padding: "4px 14px",
            fontSize: "12px",
            color: "#ccc",
            marginBottom: "2rem",
          }}
        >
          🤖 Propulsé par l'IA
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "#fff",
            lineHeight: "1.1",
            marginBottom: "1.5rem",
            maxWidth: "800px",
          }}
        >
          Gérez vos projets
          <br />
          <span style={{ color: "#9B7FD4" }}>plus intelligemment</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#aaa",
            maxWidth: "600px",
            lineHeight: "1.6",
            marginBottom: "2.5rem",
          }}
        >
          Project Manager est l'outil tout-en-un pour gérer vos projets, tâches et équipes — avec
          l'aide de l'intelligence artificielle.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onLogin}
            style={{
              fontSize: "15px",
              padding: "14px 32px",
              background: "#9B7FD4",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Commencer gratuitement →
          </button>

          <a
            href="#features"
            style={{
              fontSize: "15px",
              padding: "14px 32px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "500",
              textDecoration: "none",
            }}
          >
            Voir les fonctionnalités
          </a>
        </div>

        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "4rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { value: "8+", label: "Vues disponibles" },
            { value: "IA", label: "Intégrée" },
            { value: "100%", label: "Gratuit pour commencer" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#fff" }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FONCTIONNALITÉS ---- */}
      <section
        id="features"
        style={{
          padding: "6rem 2rem",
          background: "#fff",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "1rem",
            }}
          >
            Tout ce dont vous avez besoin
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#888",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Des outils puissants pour les équipes de toutes tailles
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                background: "#f9f9f9",
                borderRadius: "14px",
                padding: "1.5rem",
                border: "1px solid #f0f0f0",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{feature.icon}</div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#111",
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </div>
              <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- TARIFS ---- */}
      <section id="pricing" style={{ padding: "6rem 2rem", background: "#f9f9f9" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "1rem",
            }}
          >
            Des tarifs simples et transparents
          </h2>
          <p style={{ fontSize: "16px", color: "#888" }}>
            Commencez gratuitement, évoluez selon vos besoins
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            maxWidth: "900px",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                background: plan.highlighted ? "#111" : "#fff",
                borderRadius: "16px",
                padding: "2rem",
                flex: "1",
                minWidth: "250px",
                maxWidth: "280px",
                border: plan.highlighted ? "none" : "1px solid #eee",
                position: "relative",
                boxShadow: plan.highlighted ? "0 20px 60px rgba(0,0,0,0.2)" : "none",
              }}
            >
              {plan.highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#9B7FD4",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ Le plus populaire
                </div>
              )}

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: plan.highlighted ? "#fff" : "#111",
                  marginBottom: "8px",
                }}
              >
                {plan.name}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <span
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    color: plan.highlighted ? "#fff" : "#111",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: plan.highlighted ? "#aaa" : "#888",
                    marginLeft: "6px",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                {plan.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 0",
                      fontSize: "13px",
                      color: plan.highlighted ? "#ccc" : "#555",
                      borderBottom: `1px solid ${plan.highlighted ? "rgba(255,255,255,0.1)" : "#f5f5f5"}`,
                    }}
                  >
                    <span style={{ color: plan.color }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={onLogin}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: plan.highlighted ? "#9B7FD4" : "#f0f0f0",
                  color: plan.highlighted ? "#fff" : "#111",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer
        style={{
          background: "#111",
          color: "#888",
          padding: "2rem",
          textAlign: "center",
          fontSize: "13px",
        }}
      >
        <div style={{ marginBottom: "8px", color: "#fff", fontWeight: "600" }}>
          📊 Project Manager
        </div>
        <div>© 2026 COSTINCIANU Gheorghina — Tous droits réservés</div>
      </footer>
    </div>
  );
}

export default LandingPage;
