export class Helpers {
    static getItemById = <T extends { id: string }>(id: string, list: T[]): T | undefined => {
        return list.find((item: T) => item.id === id);
    };
}
