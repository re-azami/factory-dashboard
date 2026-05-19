export type ExportType = 'EXCEL' | 'PDF' | 'CSV';

interface IExportType {
    title: string;
    icon: string;
}

export const ExportTypeInfo: { [key in ExportType]: IExportType } = {
    EXCEL: { title: 'فرمت اکسل', icon: 'table_chart' },
    PDF: { title: 'فرمت PDF', icon: 'description' },
    CSV: { title: 'فرمت CSV', icon: 'toc' },
};

export const ExportTypeList: ExportType[] = Object.keys(ExportTypeInfo) as ExportType[];
