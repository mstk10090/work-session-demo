import { bookingAvailability, remainingSeats } from "../domain/booking";
import type { BookingState, WorkSession } from "../domain/booking";
import { FAILURE_MESSAGES } from "../application/demoReducer";
import { DEMO_NOW, DEMO_PARTICIPANT } from "../data/demo";
import { durationMinutes, formatTime } from "../format";
import styles from "../App.module.css";

interface Props {
  session: WorkSession;
  state: BookingState;
  onBook: (id: string) => void;
}
export function SessionCard({ session, state, onBook }: Props) {
  const availability = bookingAvailability(
    state,
    session.id,
    DEMO_PARTICIPANT,
    DEMO_NOW,
  );
  const seats = remainingSeats(state, session);
  const label = availability.ok
    ? "このワークを予約"
    : availability.reason === "already_booked"
      ? "予約済み"
      : availability.reason === "full"
        ? "満席"
        : availability.reason === "overlap"
          ? "時間が重複"
          : "受付終了";
  return (
    <article className={styles.card} aria-labelledby={`title-${session.id}`}>
      <div className={styles.cardMeta}>
        <span className={styles.tag}>{session.category}</span>
        <span>{durationMinutes(session.startsAt, session.endsAt)} min</span>
      </div>
      <h3 id={`title-${session.id}`}>{session.title}</h3>
      <p className={styles.description}>{session.description}</p>
      <div className={styles.outcome}>
        <span>持ち帰れるもの</span>
        <p>{session.outcome}</p>
      </div>
      <div className={styles.schedule}>
        <strong>
          {formatTime(session.startsAt)} — {formatTime(session.endsAt)}
        </strong>
        <span>残り {seats} 枠</span>
      </div>
      <button
        className={styles.primaryButton}
        disabled={!availability.ok}
        onClick={() => onBook(session.id)}
        aria-describedby={!availability.ok ? `reason-${session.id}` : undefined}
      >
        {label}
        <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.reason} id={`reason-${session.id}`}>
        {availability.ok
          ? `${formatTime(session.bookingClosesAt)} まで受付`
          : FAILURE_MESSAGES[availability.reason]}
      </p>
    </article>
  );
}
