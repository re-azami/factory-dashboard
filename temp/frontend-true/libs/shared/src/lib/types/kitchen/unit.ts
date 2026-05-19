export type KitchenUnit = 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'COUNT';

interface IKitchenUnit {
    title: string;
    icon: string;
}

export const KitchenUnitInfo: { [key in KitchenUnit]: IKitchenUnit } = {
    WEIGHT: { title: 'وزن', icon: 'scale' },
    VOLUME: { title: 'حجم', icon: 'coffee' },
    LENGTH: { title: 'طول', icon: 'straighten' },
    COUNT: { title: 'تعداد', icon: 'tag' },
};

export const KitchenUnitList: KitchenUnit[] = Object.keys(KitchenUnitInfo) as KitchenUnit[];
