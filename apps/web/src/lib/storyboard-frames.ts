export type StoryboardFrame = {
  id: number;
  /** Next.js route to push */
  route: string;
  /** Subtitle to display */
  narration: string;
  /** Optional flag controlling whether to trigger walk-out animation */
  triggerWalkOut?: boolean;
  /** Optional: which agent step to surface (live/cache) */
  triggerAgentMatch?: boolean;
};

export const STORYBOARD_FRAMES: ReadonlyArray<StoryboardFrame> = [
  {
    id: 1,
    route: '/fridge/inside',
    narration: '邻食是 OPC 协作平台——一到十人的小团体，把脑子里想做的事变成 idea 卡，扔进自己的灵感冰箱。',
  },
  {
    id: 2,
    route: '/fridge/inside',
    narration: '每张 idea 卡都有保鲜期。到点它就躁动——它知道自己不该烂在冰箱里。',
  },
  {
    id: 3,
    route: '/fridge/inside',
    narration: 'AI agent 主动出门，跨用户去找——不是别的商品、别的文档，是另一张能跟它配的 idea，和它背后的人。',
    triggerWalkOut: true,
    triggerAgentMatch: true,
  },
  {
    id: 4,
    route: '/activities/new',
    narration: '一桌就是一次协作，可以约线上、可以约真饭——location 是你定的。',
  },
  {
    id: 5,
    route: '/activities/11111111-0000-4000-8000-000000000004',
    narration: '局长助理是你的 agent 同事：5 分钟破冰、第一周里程碑、结束复盘——它一直在桌上。',
  },
  {
    id: 6,
    route: '/fridge',
    narration: '邻食。让脑子里那张 idea，自己找到能拼桌的人。',
  },
];
