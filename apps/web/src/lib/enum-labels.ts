import type {
  CookingSkill,
  Cuisine,
  DietaryRestriction,
} from '@lin-shi/contracts';

export const CuisineLabel: Record<Cuisine, string> = {
  SICHUAN: '川菜',
  CANTONESE: '粤菜',
  JIANGSU: '苏菜',
  ZHEJIANG: '浙菜',
  SHANDONG: '鲁菜',
  FUJIAN: '闽菜',
  HUNAN: '湘菜',
  ANHUI: '徽菜',
  NORTHEASTERN: '东北菜',
  XINJIANG: '新疆菜',
  JAPANESE: '日料',
  KOREAN: '韩料',
  THAI: '泰菜',
  VIETNAMESE: '越南菜',
  ITALIAN: '意大利',
  FRENCH: '法餐',
  AMERICAN: '美式',
  MEXICAN: '墨西哥',
  INDIAN: '印度',
  MIDDLE_EASTERN: '中东',
};

export const DietaryLabel: Record<DietaryRestriction, string> = {
  VEGETARIAN: '素食',
  VEGAN: '纯素',
  HALAL: '清真',
  KOSHER: 'Kosher',
  GLUTEN_FREE: '无麸质',
  LACTOSE_FREE: '无乳糖',
  NUT_FREE: '无坚果',
  SEAFOOD_FREE: '无海鲜',
  LOW_SPICE: '不吃辣',
  LOW_SODIUM: '低盐',
};

export const CookingSkillLabel: Record<CookingSkill, string> = {
  BEGINNER: '新手',
  INTERMEDIATE: '家常水平',
  ADVANCED: '老手',
  EXPERT: '大师',
};
