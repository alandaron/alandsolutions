import { IBaseListItem } from './IBaseListItem';

export interface ITaskListItem extends IBaseListItem {
    StartDate: Date;
    EndDate: Date;
    Color: string;
}
