import { bookSession, cancelBooking } from "../domain/booking";
import type { BookingState, FailureReason } from "../domain/booking";
import { DEMO_NOW, DEMO_PARTICIPANT, INITIAL_STATE } from "../data/demo";

export const FAILURE_MESSAGES: Record<FailureReason, string> = {
  not_found: "対象の予約・ワークが見つかりません。",
  already_booked: "このワークは予約済みです。",
  closed: "予約の受付を終了しました。",
  full: "このワークは満席です。",
  overlap: "予約済みのワークと時間が重なっています。",
  forbidden: "自分の予約だけキャンセルできます。",
  not_active: "この予約はキャンセル済みです。",
  started: "開始後のキャンセルはできません。",
  invalid_session: "ワークの設定を確認できません。",
};
export interface DemoState {
  readonly booking: BookingState;
  readonly message: string;
}
export type DemoAction =
  | { type: "book"; sessionId: string }
  | { type: "cancel"; bookingId: string }
  | { type: "reset" };
export const INITIAL_DEMO: DemoState = { booking: INITIAL_STATE, message: "" };

/** React's reducer serializes local actions; this is not a multi-user server lock. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "reset")
    return { ...INITIAL_DEMO, message: "デモを最初の状態に戻しました。" };
  const result =
    action.type === "book"
      ? bookSession(state.booking, action.sessionId, DEMO_PARTICIPANT, DEMO_NOW)
      : cancelBooking(
          state.booking,
          action.bookingId,
          DEMO_PARTICIPANT,
          DEMO_NOW,
        );
  return {
    booking: result.state,
    message: result.ok
      ? action.type === "book"
        ? "予約しました。「自分の予約」で確認できます。"
        : "予約をキャンセルしました。空き枠も更新しました。"
      : FAILURE_MESSAGES[result.reason],
  };
}
