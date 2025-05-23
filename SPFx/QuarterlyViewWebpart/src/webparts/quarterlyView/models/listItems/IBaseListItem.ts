import { IUserFieldValue } from '../fields/IUserField';
import { IAttachmentFile } from '../IAttachmentFile';

export interface IBaseListItem {
    ID?: number;
    Id?: number;
    Title?: string;
    Created?: string;
    Author?: IUserFieldValue;
    AttachmentFiles?: IAttachmentFile[];
    FileLeafRef?: string;
    FileRef?: string;
}
