interface IWarehouseQuestion {
    title: string;
    keyLength: number;
    createJoin: boolean;
}

export const WarehouseQuestion: IWarehouseQuestion[] = [
    { title: 'رسته صنعت', keyLength: 1, createJoin: false },
    { title: 'ماهیت کالا', keyLength: 1, createJoin: false },
    { title: 'شرح مختصر کالا', keyLength: 2, createJoin: false },
    { title: 'واحد بیشترین درخواست', keyLength: 1, createJoin: true },
    { title: 'جنس', keyLength: 2, createJoin: true },
];
