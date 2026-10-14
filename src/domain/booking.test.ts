import { describe, expect, it } from "vitest";
import {
  bookSession,
  bookingAvailability,
  cancelBooking,
  remainingSeats,
} from "./booking";
import type { BookingState, BookingResult } from "./booking";
import { DEMO_NOW, DEMO_PARTICIPANT, INITIAL_STATE } from "../data/demo";

function success(result: BookingResult): BookingState {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.reason);
  return result.state;
}
function withSession(
  overrides: Partial<BookingState["sessions"][number]>,
): BookingState {
  return {
    ...INITIAL_STATE,
    sessions: INITIAL_STATE.sessions.map((s) =>
      s.id === "research" ? { ...s, ...overrides } : s,
    ),
  };
}
describe("予約の業務ルール", () => {
  it("予約で残り枠が1つ減り、元の状態は変更しない", () => {
    const session = INITIAL_STATE.sessions[0]!;
    const next = success(
      bookSession(INITIAL_STATE, session.id, DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(remainingSeats(next, session)).toBe(1);
    expect(remainingSeats(INITIAL_STATE, session)).toBe(2);
    expect(next.nextBookingNumber).toBe(2);
  });
  it("二重送信でも同じ利用者の予約を増やさない", () => {
    const first = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    const second = bookSession(first, "research", DEMO_PARTICIPANT, DEMO_NOW);
    expect(second).toMatchObject({ ok: false, reason: "already_booked" });
    expect(second.state).toBe(first);
  });
  it("締切の1ミリ秒前は受付、締切ちょうどは拒否する", () => {
    const deadline = Date.parse(INITIAL_STATE.sessions[0]!.bookingClosesAt);
    expect(
      bookingAvailability(
        INITIAL_STATE,
        "research",
        DEMO_PARTICIPANT,
        deadline - 1,
      ).ok,
    ).toBe(true);
    expect(
      bookingAvailability(
        INITIAL_STATE,
        "research",
        DEMO_PARTICIPANT,
        deadline,
      ),
    ).toEqual({ ok: false, reason: "closed" });
  });
  it("開始後は予約できない", () => {
    expect(
      bookSession(
        INITIAL_STATE,
        "research",
        DEMO_PARTICIPANT,
        Date.parse("2030-04-08T10:00:00+09:00"),
      ),
    ).toMatchObject({ ok: false, reason: "closed" });
  });
  it("満席では予約できない", () => {
    expect(
      bookSession(INITIAL_STATE, "full", DEMO_PARTICIPANT, DEMO_NOW),
    ).toMatchObject({ ok: false, reason: "full" });
  });
  it("最後の枠への連続した要求でも定員を超えない", () => {
    const first = success(
      bookSession(
        withSession({ capacity: 2 }),
        "research",
        "participant-c",
        DEMO_NOW,
      ),
    );
    const second = bookSession(first, "research", "participant-d", DEMO_NOW);
    expect(second).toMatchObject({ ok: false, reason: "full" });
    expect(remainingSeats(second.state, second.state.sessions[0]!)).toBe(0);
  });
  it("時間が一部でも重なる予約を拒否する", () => {
    const first = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(
      bookSession(first, "writing", DEMO_PARTICIPANT, DEMO_NOW),
    ).toMatchObject({ ok: false, reason: "overlap" });
  });
  it("終了時刻と開始時刻が一致する連続予約は許可する", () => {
    const state = {
      ...INITIAL_STATE,
      sessions: INITIAL_STATE.sessions.map((s) =>
        s.id === "writing"
          ? { ...s, startsAt: "2030-04-08T11:30:00+09:00" }
          : s,
      ),
    };
    const first = success(
      bookSession(state, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(bookSession(first, "writing", DEMO_PARTICIPANT, DEMO_NOW).ok).toBe(
      true,
    );
  });
  it("別の利用者の予約時間とは競合しない", () => {
    const first = success(
      bookSession(INITIAL_STATE, "research", "participant-c", DEMO_NOW),
    );
    expect(bookSession(first, "writing", DEMO_PARTICIPANT, DEMO_NOW).ok).toBe(
      true,
    );
  });
  it("存在しないワークの予約を拒否する", () => {
    expect(
      bookSession(INITIAL_STATE, "missing", DEMO_PARTICIPANT, DEMO_NOW),
    ).toMatchObject({ ok: false, reason: "not_found" });
  });
  it("定員0は募集枠なしとして扱う", () => {
    expect(
      bookSession(
        withSession({ capacity: 0 }),
        "research",
        DEMO_PARTICIPANT,
        DEMO_NOW,
      ),
    ).toMatchObject({ ok: false, reason: "full" });
  });
  it.each([
    { capacity: -1 },
    { capacity: 1.5 },
    { startsAt: "invalid" },
    { endsAt: "2030-04-08T09:00:00+09:00" },
    { bookingClosesAt: "2030-04-08T12:00:00+09:00" },
  ])("不正な設定を拒否する: %j", (overrides) => {
    expect(
      bookSession(
        withSession(overrides),
        "research",
        DEMO_PARTICIPANT,
        DEMO_NOW,
      ),
    ).toMatchObject({ ok: false, reason: "invalid_session" });
  });
  it("不正な時計を拒否する", () => {
    expect(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, NaN),
    ).toMatchObject({ ok: false, reason: "invalid_session" });
  });
});

describe("キャンセルの業務ルール", () => {
  it("キャンセルで枠が戻り、再予約には新しいIDを使う", () => {
    const booked = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    const cancelled = success(
      cancelBooking(booked, "booking-1", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(remainingSeats(cancelled, cancelled.sessions[0]!)).toBe(2);
    const again = success(
      bookSession(cancelled, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(again.bookings.find((b) => b.id === "booking-1")?.status).toBe(
      "cancelled",
    );
    expect(again.bookings.find((b) => b.id === "booking-2")?.status).toBe(
      "confirmed",
    );
  });
  it("キャンセルした時間帯は再び予約できる", () => {
    const booked = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    const cancelled = success(
      cancelBooking(booked, "booking-1", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(
      bookSession(cancelled, "writing", DEMO_PARTICIPANT, DEMO_NOW).ok,
    ).toBe(true);
  });
  it("他人の予約をキャンセルできない", () => {
    expect(
      cancelBooking(INITIAL_STATE, "fixture-1", DEMO_PARTICIPANT, DEMO_NOW),
    ).toMatchObject({ ok: false, reason: "forbidden", state: INITIAL_STATE });
  });
  it("存在しない予約をキャンセルできない", () => {
    expect(
      cancelBooking(INITIAL_STATE, "missing", DEMO_PARTICIPANT, DEMO_NOW),
    ).toMatchObject({ ok: false, reason: "not_found" });
  });
  it("二重キャンセルで空き枠を増やさない", () => {
    const booked = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    const cancelled = success(
      cancelBooking(booked, "booking-1", DEMO_PARTICIPANT, DEMO_NOW),
    );
    const twice = cancelBooking(
      cancelled,
      "booking-1",
      DEMO_PARTICIPANT,
      DEMO_NOW,
    );
    expect(twice).toMatchObject({ ok: false, reason: "not_active" });
    expect(twice.state).toBe(cancelled);
  });
  it("開始時刻ちょうどからキャンセルできない", () => {
    const booked = success(
      bookSession(INITIAL_STATE, "research", DEMO_PARTICIPANT, DEMO_NOW),
    );
    expect(
      cancelBooking(
        booked,
        "booking-1",
        DEMO_PARTICIPANT,
        Date.parse("2030-04-08T10:00:00+09:00"),
      ),
    ).toMatchObject({ ok: false, reason: "started" });
  });
});
