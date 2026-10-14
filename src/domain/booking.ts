/** Domain rules are pure: no React, network, storage, or wall-clock access. */
export type Category = "リサーチ" | "ライティング" | "データ整理";
export interface WorkSession {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly outcome: string;
  readonly category: Category;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly bookingClosesAt: string;
  readonly capacity: number;
}
export interface Booking {
  readonly id: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly status: "confirmed" | "cancelled";
}
export interface BookingState {
  readonly sessions: readonly WorkSession[];
  readonly bookings: readonly Booking[];
  readonly nextBookingNumber: number;
}
export type FailureReason =
  | "not_found"
  | "already_booked"
  | "closed"
  | "full"
  | "overlap"
  | "forbidden"
  | "not_active"
  | "started"
  | "invalid_session";
export type Availability =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: FailureReason };
export type BookingResult =
  | { readonly ok: true; readonly state: BookingState }
  | {
      readonly ok: false;
      readonly reason: FailureReason;
      readonly state: BookingState;
    };

export function remainingSeats(
  state: BookingState,
  session: WorkSession,
): number {
  const used = state.bookings.filter(
    (b) => b.sessionId === session.id && b.status === "confirmed",
  ).length;
  return Math.max(0, session.capacity - used);
}

export function bookingAvailability(
  state: BookingState,
  sessionId: string,
  participantId: string,
  now: number,
): Availability {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) return { ok: false, reason: "not_found" };
  const start = Date.parse(session.startsAt);
  const end = Date.parse(session.endsAt);
  const closes = Date.parse(session.bookingClosesAt);
  if (
    ![start, end, closes, now].every(Number.isFinite) ||
    end <= start ||
    closes > start ||
    !Number.isInteger(session.capacity) ||
    session.capacity < 0
  ) {
    return { ok: false, reason: "invalid_session" };
  }
  const ownBookings = state.bookings.filter(
    (b) => b.participantId === participantId && b.status === "confirmed",
  );
  if (ownBookings.some((b) => b.sessionId === sessionId))
    return { ok: false, reason: "already_booked" };
  if (now >= closes || now >= start) return { ok: false, reason: "closed" };
  if (remainingSeats(state, session) === 0)
    return { ok: false, reason: "full" };
  const overlap = ownBookings.some((b) => {
    const other = state.sessions.find((s) => s.id === b.sessionId);
    return (
      other &&
      start < Date.parse(other.endsAt) &&
      Date.parse(other.startsAt) < end
    );
  });
  return overlap ? { ok: false, reason: "overlap" } : { ok: true };
}

export function bookSession(
  state: BookingState,
  sessionId: string,
  participantId: string,
  now: number,
): BookingResult {
  const availability = bookingAvailability(
    state,
    sessionId,
    participantId,
    now,
  );
  if (!availability.ok) return { ...availability, state };
  const booking: Booking = {
    id: `booking-${state.nextBookingNumber}`,
    sessionId,
    participantId,
    status: "confirmed",
  };
  return {
    ok: true,
    state: {
      ...state,
      bookings: [...state.bookings, booking],
      nextBookingNumber: state.nextBookingNumber + 1,
    },
  };
}

export function cancelBooking(
  state: BookingState,
  bookingId: string,
  participantId: string,
  now: number,
): BookingResult {
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, reason: "not_found", state };
  if (booking.participantId !== participantId)
    return { ok: false, reason: "forbidden", state };
  if (booking.status !== "confirmed")
    return { ok: false, reason: "not_active", state };
  const session = state.sessions.find((s) => s.id === booking.sessionId);
  if (
    !session ||
    !Number.isFinite(now) ||
    !Number.isFinite(Date.parse(session.startsAt))
  )
    return { ok: false, reason: "invalid_session", state };
  if (now >= Date.parse(session.startsAt))
    return { ok: false, reason: "started", state };
  return {
    ok: true,
    state: {
      ...state,
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b,
      ),
    },
  };
}
