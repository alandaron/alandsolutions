/* tslint:disable:typedef variable-name */
import { GenericList, IGenericList } from '../models/List';

export abstract class BaseListFields {
    public static readonly id: string = 'Id';
    public static readonly ID: string = 'ID';
    public static readonly title: string = 'Title';
    public static readonly created: string = 'Created';
    public static readonly modified: string = 'Modified';
    public static readonly author: string = 'Author';
    public static readonly createdBy: string = 'CreatedBy';
    public static readonly rootFolder: string = 'RootFolder';
    public static readonly contentType: string = 'ContentType';
    public static readonly attachmentFiles: string = 'AttachmentFiles';
    public static readonly fileLeafRef: string = 'FileLeafRef';
    public static readonly fileRef: string = 'FileRef';
    public static readonly fsObjType: string = 'FSObjType';
}

export abstract class BaseLinkListFields extends BaseListFields {
    public static readonly url: string = 'URL';
}

export class TasksList {
    public static readonly list: IGenericList = new GenericList('Tasks');
    public static readonly fields = class extends BaseListFields {
        public static readonly startDate = 'StartDate';
        public static readonly endDate = 'EndDate';
    };
}
