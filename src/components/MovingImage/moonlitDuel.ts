export interface MoonlitChapter {
  index: string;
  title: string;
  time: number;
  timeLabel: string;
  image: string;
  alt: string;
}

export const moonlitDuel = {
  title: "月下双刃",
  source: "/videos/moving-image/moonlit-duel.mp4",
  poster: "/images/moving-image/moonlit-duel-poster.jpg",
  duration: 60.659,
} as const;

export const moonlitChapters: MoonlitChapter[] = [
  {
    index: "01",
    title: "雾岭建立",
    time: 1.2,
    timeLabel: "00:01",
    image: "/images/moving-image/moonlit-duel-frame-01.jpg",
    alt: "云雾笼罩的群山与孤峰古亭",
  },
  {
    index: "02",
    title: "双刃相见",
    time: 6.4,
    timeLabel: "00:06",
    image: "/images/moving-image/moonlit-duel-frame-02.jpg",
    alt: "雨夜古寺中持银刃与赤刃相对的两名侠客",
  },
  {
    index: "03",
    title: "雨院临战",
    time: 28.5,
    timeLabel: "00:28",
    image: "/images/moving-image/moonlit-duel-frame-03.jpg",
    alt: "月下雨院中披暗红斗篷的持刀侠客",
  },
  {
    index: "04",
    title: "赤影交锋",
    time: 53,
    timeLabel: "00:53",
    image: "/images/moving-image/moonlit-duel-frame-04.jpg",
    alt: "银刃与赤刃在月下碰撞迸发火花的近景",
  },
];
