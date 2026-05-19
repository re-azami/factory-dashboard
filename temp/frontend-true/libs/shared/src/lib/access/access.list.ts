import { Access } from './access.type';
import { AccessInfo } from './access.info';

export const AccessList: Access[] = Object.keys(AccessInfo) as Access[];
