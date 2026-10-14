import type { BookingState } from "../domain/booking";
import { DEMO_PARTICIPANT } from "../data/demo";
import { formatTime } from "../format";
import styles from "../App.module.css";
interface Props {
  state: BookingState;
  onCancel: (id: string) => void;
}
export function BookingPanel({ state, onCancel }: Props) {
  const bookings = state.bookings.filter(
    (b) => b.participantId === DEMO_PARTICIPANT && b.status === "confirmed",
  );
  return (
    <aside className={styles.panel} aria-labelledby="bookings-heading">
      <div className={styles.panelHeading}>
        <h2 id="bookings-heading">自分の予約</h2>
        <span className={styles.count}>{bookings.length}</span>
      </div>
      <p className={styles.panelSub}>4月8日（月）・すべてオンライン</p>
      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <span aria-hidden="true">＋</span>
          <h3>最初の一歩を、ひとつ。</h3>
          <p>
            気になるワークを予約すると、
            <br />
            ここに予定が表示されます。
          </p>
        </div>
      ) : (
        <ul className={styles.bookings}>
          {bookings.map((b) => {
            const session = state.sessions.find((s) => s.id === b.sessionId);
            if (!session) return null;
            return (
              <li key={b.id}>
                <time>
                  {formatTime(session.startsAt)} — {formatTime(session.endsAt)}
                </time>
                <h3>{session.title}</h3>
                <button
                  className={styles.textButton}
                  onClick={() => onCancel(b.id)}
                  aria-label={`${session.title}の予約をキャンセル`}
                >
                  予約をキャンセル
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className={styles.note}>
        <strong>予定に合う、小さな挑戦を。</strong>
        <p>
          時間の重なるワークは予約できません。開始前ならキャンセルできます。
        </p>
      </div>
    </aside>
  );
}
