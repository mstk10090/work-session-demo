import { useReducer, useState } from "react";
import { demoReducer, INITIAL_DEMO } from "./application/demoReducer";
import { CATEGORIES } from "./data/demo";
import type { Category } from "./domain/booking";
import { SessionCard } from "./components/SessionCard";
import { BookingPanel } from "./components/BookingPanel";
import styles from "./App.module.css";

export default function App() {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_DEMO);
  const [category, setCategory] = useState<Category | "すべて">("すべて");
  const [query, setQuery] = useState("");
  const visibleSessions = state.booking.sessions.filter(
    (s) =>
      (category === "すべて" || s.category === category) &&
      `${s.title}${s.description}`
        .normalize("NFKC")
        .toLowerCase()
        .includes(query.normalize("NFKC").trim().toLowerCase()),
  );
  return (
    <>
      <a className={styles.skipLink} href="#main">
        本文へ移動
      </a>
      <header className={styles.header}>
        <a className={styles.brand} href="./">
          <span aria-hidden="true">w.</span>Work Session
        </a>
        <span className={styles.demoBadge}>PORTFOLIO DEMO</span>
        <a
          className={styles.sourceLink}
          href="https://github.com/mstk10090/work-session-demo"
        >
          コードを見る <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div>
            <p className={styles.eyebrow}>A SMALL STEP, A NEW POSSIBILITY.</p>
            <h1 id="page-title">
              空いた時間を、
              <br />
              小さな実務経験に。
            </h1>
            <p className={styles.heroCopy}>
              60〜90分で、仕事の一部を体験する。
              <br />
              気になるテーマから、次の一歩を見つけよう。
            </p>
          </div>
          <div className={styles.dateCard}>
            <span>DEMO DAY</span>
            <strong>
              04<span>/</span>08
            </strong>
            <p>MONDAY · 2030</p>
            <div>現在時刻 09:00 JST</div>
          </div>
        </section>
        <div className={styles.demoNotice}>
          架空データで動く操作デモです。実際の応募・送信は行いません。再読み込みで予約はリセットされます。
          <button
            className={styles.textButton}
            onClick={() => dispatch({ type: "reset" })}
          >
            デモをリセット
          </button>
        </div>
        <p className={styles.feedback} role="status" aria-live="polite">
          {state.message}
        </p>
        <div className={styles.layout}>
          <section aria-labelledby="sessions-heading">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>EXPLORE</p>
                <h2 id="sessions-heading">
                  今日のワーク <span>{visibleSessions.length}</span>
                </h2>
              </div>
              <label className={styles.search}>
                <span className={styles.srOnly}>ワークを検索</span>
                <input
                  type="search"
                  placeholder="テーマを検索"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div
              className={styles.filters}
              role="group"
              aria-label="カテゴリで絞り込む"
            >
              {(["すべて", ...CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={
                    category === c ? styles.selectedFilter : styles.filter
                  }
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className={styles.grid}>
              {visibleSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  state={state.booking}
                  onBook={(id) => dispatch({ type: "book", sessionId: id })}
                />
              ))}
            </div>
            {visibleSessions.length === 0 && (
              <p className={styles.noResults}>
                該当するワークがありません。検索条件を変えてみてください。
              </p>
            )}
          </section>
          <BookingPanel
            state={state.booking}
            onCancel={(id) => dispatch({ type: "cancel", bookingId: id })}
          />
        </div>
      </main>
      <footer className={styles.footer}>
        <span>Work Session / Portfolio sample</span>
        <a href="https://github.com/mstk10090/work-session-demo/blob/main/docs/architecture.md">
          設計とトレードオフ ↗
        </a>
      </footer>
    </>
  );
}
