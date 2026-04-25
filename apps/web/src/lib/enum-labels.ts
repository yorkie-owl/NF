import type {
  CookingSkill,
  Cuisine,
  DietaryRestriction,
} from '@lin-shi/contracts';

export const CuisineLabel: Record<Cuisine, string> = {
  SICHUAN: '产品',
  CANTONESE: '工程',
  JIANGSU: '设计',
  ZHEJIANG: '内容',
  SHANDONG: '咨询',
  FUJIAN: '独立创业',
  HUNAN: '早期社区',
  ANHUI: 'B2B SaaS',
  NORTHEASTERN: '教育',
  XINJIANG: '数据',
  JAPANESE: 'AI',
  KOREAN: '品牌',
  THAI: '电商',
  VIETNAMESE: '媒体',
  ITALIAN: '出版',
  FRENCH: '公关',
  AMERICAN: '法律',
  MEXICAN: '财税',
  INDIAN: 'HR',
  MIDDLE_EASTERN: '活动',
};

export const DietaryLabel: Record<DietaryRestriction, string> = {
  VEGETARIAN: '无远程',
  VEGAN: '仅线下',
  HALAL: '不接陌生',
  KOSHER: '周末优先',
  GLUTEN_FREE: '不带娃',
  LACTOSE_FREE: '不接外包',
  NUT_FREE: '拒绝早C',
  SEAFOOD_FREE: '不破圈',
  LOW_SPICE: '不接非营利',
  LOW_SODIUM: '拒绝模糊需求',
};

export const CookingSkillLabel: Record<CookingSkill, string> = {
  BEGINNER: '新手',
  INTERMEDIATE: '进阶',
  ADVANCED: '资深',
  EXPERT: '专家',
};
