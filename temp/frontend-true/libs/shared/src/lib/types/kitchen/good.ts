export type KitchenGood = 'INGREDIENT' | 'ADDITIVE' | 'CONSUMABLE';

interface IKitchenGood {
    icon: string;
    title: string;
    description: string;
    hasGroup: boolean;
}

export const KitchenGoodInfo: { [key in KitchenGood]: IKitchenGood } = {
    INGREDIENT: {
        icon: 'kebab_dining',
        title: 'مواد غذایی',
        description: 'مواد اولیه خوراکی برای پخت‌وپز، نوشیدنی‌ها و دسرها',
        hasGroup: true,
    },
    ADDITIVE: {
        icon: 'soup_kitchen',
        title: 'مواد افزودنی',
        description: 'ادویه‌ها و چاشنی‌ها برای تغییر طعم و مزه',
        hasGroup: true,
    },
    CONSUMABLE: {
        icon: 'clean_hands',
        title: 'مواد مصرفی',
        description: 'لوازم غیرخوراکی برای پخت‌وپز، سرو غذا و نظافت',
        hasGroup: false,
    },
};

export const KitchenGoodList: KitchenGood[] = Object.keys(KitchenGoodInfo) as KitchenGood[];
