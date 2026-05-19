export type UserGroup = 'MANAGER' | 'ADMIN' | 'USER';

interface IUserGroup {
    title: string;
    icon: string;
}

export const UserGroupInfo: { [key in UserGroup]: IUserGroup } = {
    MANAGER: { title: 'مدیر سیستم', icon: 'manage_accounts' },
    ADMIN: { title: 'مدیر', icon: 'engineering' },
    USER: { title: 'کاربر', icon: 'person' },
};

export const UserGroupList: UserGroup[] = Object.keys(UserGroupInfo) as UserGroup[];
