export type KitchenInventory = 'ENTER' | 'EXIT' | 'RESET' | 'SERVING';

interface IKitchenInventory {
    title: string;
    icon: string;
    color: 'primary' | 'accent' | 'warn';
    userAction: boolean;
}

export const KitchenInventoryInfo: { [key in KitchenInventory]: IKitchenInventory } = {
    ENTER: { title: 'ورود کالا به انبار', icon: 'login', color: 'primary', userAction: true },
    EXIT: { title: 'خروج کالا از انبار', icon: 'logout', color: 'warn', userAction: true },
    RESET: { title: 'تغییر موجودی کالا', icon: 'warehouse', color: 'accent', userAction: true },
    SERVING: { title: 'سرو غذا', icon: 'dining', color: 'warn', userAction: false },
};

export const KitchenInventoryList: KitchenInventory[] = Object.keys(KitchenInventoryInfo) as KitchenInventory[];
