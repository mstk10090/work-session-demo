import type { BookingState, Category } from "../domain/booking";

/** Entirely fictional fixtures. A fixed clock keeps the demo reproducible. */
export const DEMO_NOW = Date.parse("2030-04-08T09:00:00+09:00");
export const DEMO_PARTICIPANT = "demo-viewer";
export const CATEGORIES: readonly Category[] = [
  "リサーチ",
  "ライティング",
  "データ整理",
];
export const INITIAL_STATE: BookingState = {
  nextBookingNumber: 1,
  sessions: [
    {
      id: "research",
      title: "街のカフェをリサーチする",
      category: "リサーチ",
      description: "架空のカフェ3店を比較し、どんな人に選ばれるかを考えます。",
      outcome: "比較表と、改善アイデアを1つ",
      startsAt: "2030-04-08T10:00:00+09:00",
      endsAt: "2030-04-08T11:30:00+09:00",
      bookingClosesAt: "2030-04-08T09:30:00+09:00",
      capacity: 3,
    },
    {
      id: "writing",
      title: "商品の魅力を言葉にする",
      category: "ライティング",
      description: "架空の文具ブランドの紹介文を、届けたい相手から考えます。",
      outcome: "紹介文と、表現を選んだ理由",
      startsAt: "2030-04-08T11:00:00+09:00",
      endsAt: "2030-04-08T12:00:00+09:00",
      bookingClosesAt: "2030-04-08T10:00:00+09:00",
      capacity: 2,
    },
    {
      id: "data",
      title: "アンケートから気づきを探す",
      category: "データ整理",
      description: "架空の回答データを整理して、次に確かめたい仮説を作ります。",
      outcome: "集計表と、根拠のある仮説",
      startsAt: "2030-04-08T13:00:00+09:00",
      endsAt: "2030-04-08T14:30:00+09:00",
      bookingClosesAt: "2030-04-08T12:00:00+09:00",
      capacity: 4,
    },
    {
      id: "full",
      title: "サービスの使いやすさを調べる",
      category: "リサーチ",
      description: "架空の申込画面を観察し、迷いやすい箇所を見つけます。",
      outcome: "改善提案メモ",
      startsAt: "2030-04-08T15:00:00+09:00",
      endsAt: "2030-04-08T16:00:00+09:00",
      bookingClosesAt: "2030-04-08T14:00:00+09:00",
      capacity: 1,
    },
    {
      id: "closed",
      title: "読みやすい案内文を作る",
      category: "ライティング",
      description: "架空イベントの案内文を整理し、必要な情報を伝えます。",
      outcome: "案内文の改善案",
      startsAt: "2030-04-08T09:30:00+09:00",
      endsAt: "2030-04-08T10:30:00+09:00",
      bookingClosesAt: "2030-04-08T08:30:00+09:00",
      capacity: 2,
    },
  ],
  bookings: [
    {
      id: "fixture-1",
      sessionId: "research",
      participantId: "fictional-participant-a",
      status: "confirmed",
    },
    {
      id: "fixture-2",
      sessionId: "full",
      participantId: "fictional-participant-b",
      status: "confirmed",
    },
  ],
};
