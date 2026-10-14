import { describe, expect, it } from "vitest";
import { demoReducer, INITIAL_DEMO } from "./demoReducer";
import { DEMO_PARTICIPANT } from "../data/demo";
describe("画面と業務ルールの接続", () => {
  it("予約・キャンセル・リセットで状態とメッセージを更新する", () => {
    const booked = demoReducer(INITIAL_DEMO, {
      type: "book",
      sessionId: "research",
    });
    expect(booked.message).toContain("予約しました");
    expect(
      booked.booking.bookings.filter(
        (b) => b.participantId === DEMO_PARTICIPANT,
      ),
    ).toHaveLength(1);
    const cancelled = demoReducer(booked, {
      type: "cancel",
      bookingId: "booking-1",
    });
    expect(cancelled.message).toContain("キャンセルしました");
    const reset = demoReducer(cancelled, { type: "reset" });
    expect(reset.booking).toBe(INITIAL_DEMO.booking);
  });
  it("画面からの連打でも予約数を増やさず理由を伝える", () => {
    const booked = demoReducer(INITIAL_DEMO, {
      type: "book",
      sessionId: "research",
    });
    const duplicate = demoReducer(booked, {
      type: "book",
      sessionId: "research",
    });
    expect(duplicate.booking).toBe(booked.booking);
    expect(duplicate.message).toBe("このワークは予約済みです。");
  });
});
