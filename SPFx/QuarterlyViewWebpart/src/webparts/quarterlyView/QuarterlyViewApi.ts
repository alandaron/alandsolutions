// Import the getGraph and getSP functions from pnpjsConfig.ts file.
import { SPFI } from '@pnp/sp';
import { getSP } from './pnpjsConfig';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IListInfo } from '@pnp/sp/lists';
import { ListProperties } from './constants/Properties';
import { TasksList } from './constants/Lists';
import { ITaskListItem } from './models/listItems/ITaskListItem';

export default class QuarterlyViewApi {
    public taskListId: string;
    private _sp: SPFI;

    constructor(context: WebPartContext) {
        this._sp = getSP(context);
    }

    public async getLists(): Promise<IListInfo[]> {
        const lists: IListInfo[] = await this._sp.web.lists.filter(
            `${ListProperties.BaseTemplate} eq 100 and ${ListProperties.Hidden} eq false`
        )();
        return lists;
    }

    public async getTasksByStartAndEndDate(startDate: Date, endDate: Date): Promise<ITaskListItem[]> {
        const tasks: ITaskListItem[] = await this._sp.web.lists
            .getById(this.taskListId)
            .items.filter(
                `${TasksList.fields.startDate} le datetime'${endDate.toISOString()}' and ${
                    TasksList.fields.endDate
                } ge datetime'${startDate.toISOString()}'`
            )();
        return tasks;
    }

    public async getTasksCount(): Promise<number> {
        const tasks: ITaskListItem[] = await this._sp.web.lists.getById(this.taskListId).items();
        return tasks.length;
    }

    public async addTask(task: ITaskListItem): Promise<void> {
        await this._sp.web.lists.getById(this.taskListId).items.add({
            Title: task.Title,
            StartDate: task.StartDate,
            EndDate: task.EndDate,
            Color: task.Color
        });
    }
}
