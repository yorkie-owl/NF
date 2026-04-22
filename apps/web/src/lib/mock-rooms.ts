export interface RoomDetail {
  id: string;
  title: string;
  time: string;
  location: string;
  currentCount: number;
  maxCount: number;
  recommendedDish: string;
  recommendedReason: string;
  participants: {
    id: string;
    name: string;
    role: '锅主' | '参与者';
    avatar: string;
    ingredients: string[];
  }[];
}

export const MOCK_ROOM_DETAILS: Record<string, RoomDetail> = {
  'room-1': {
    id: 'room-1',
    title: '今晚煮面',
    time: '今晚 7:00',
    location: '杨浦区',
    currentCount: 2,
    maxCount: 3,
    recommendedDish: '番茄鸡蛋面',
    recommendedReason: '柴桥子有面条🍝，你有番茄🍅鸡蛋🥚',
    participants: [
      { id: '1', name: '柴桥子', role: '锅主', avatar: '👩', ingredients: ['🍝'] },
      { id: '2', name: '我', role: '参与者', avatar: '🧑', ingredients: ['🍅', '🥚'] },
    ],
  },
  'room-2': {
    id: 'room-2',
    title: '周末饺子局',
    time: '周六下午 3:00',
    location: '静安区',
    currentCount: 4,
    maxCount: 5,
    recommendedDish: '猪肉白菜饺子',
    recommendedReason: '周雨有面皮🥟，你有白菜🥬洋葱🧅',
    participants: [
      { id: '1', name: '周雨', role: '锅主', avatar: '👩', ingredients: ['🥟', '🌿'] },
      { id: '2', name: '我', role: '参与者', avatar: '🧑', ingredients: ['🥬', '🧅'] },
      { id: '3', name: '柴桥子', role: '参与者', avatar: '👩', ingredients: ['🧄', '🫙'] },
      { id: '4', name: '小林', role: '参与者', avatar: '🧑', ingredients: ['🧂'] },
    ],
  },
  'room-3': {
    id: 'room-3',
    title: '素食酸汤锅',
    time: '明晚 6:30',
    location: '长宁区',
    currentCount: 1,
    maxCount: 4,
    recommendedDish: '素食酸汤锅',
    recommendedReason: '你有豆腐🫕和蔬菜🥦，适合素食轻食',
    participants: [
      { id: '1', name: '我', role: '锅主', avatar: '🧑', ingredients: ['🫕', '🥦'] },
    ],
  },
};
