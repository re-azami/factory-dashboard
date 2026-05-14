export type PageMenuChild =
    | 'DIVIDER'
    | {
          readonly title: string;
          readonly action: string[] | (() => void);
      };

export interface IPageMenu {
    readonly id?: string;
    readonly title: string;
    readonly icon: string;
    readonly children: PageMenuChild[];
}
