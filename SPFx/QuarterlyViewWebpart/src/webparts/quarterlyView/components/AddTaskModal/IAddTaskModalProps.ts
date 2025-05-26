import { ITaskListItem } from '../../models/listItems/ITaskListItem';

export interface IAddTaskModalProps {
    locale: string;
    isAdding: boolean;
    addTask: (task: ITaskListItem) => Promise<void>;
    hideModal: () => void;
}
