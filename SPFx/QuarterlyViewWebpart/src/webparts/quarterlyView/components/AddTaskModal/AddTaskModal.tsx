import * as React from 'react';
import { IAddTaskModalProps } from './IAddTaskModalProps';
import {
    ColorPicker,
    DatePicker,
    DefaultButton,
    defaultDatePickerStrings,
    IColor,
    IconButton,
    Modal,
    PrimaryButton,
    Spinner,
    SpinnerSize,
    TextField
} from '@fluentui/react';
import styles from './AddTaskModal.module.scss';
import * as strings from 'QuarterlyViewWebPartStrings';
import { datePickerStrings } from '../../constants/DatePickerStrings';
import { dateFormat } from '../../constants/DateTime';
import { format } from 'date-fns';

export default function AddTaskModal(props: IAddTaskModalProps): React.ReactElement<IAddTaskModalProps> {
    const [title, setTitle] = React.useState<string>('');
    const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
    const [color, setColor] = React.useState<IColor>();

    return (
        <Modal isOpen={true} onDismiss={props.hideModal} isBlocking={false} containerClassName={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <h2>{strings.AddNewTask}</h2>
                <IconButton
                    className={styles.closeButton}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={props.hideModal}
                />
            </div>
            <div className={styles.modalBody}>
                <TextField label={strings.Title} required onChange={(_, value) => setTitle(value ?? '')} />
                <DatePicker
                    strings={props.locale === 'et-ee' ? datePickerStrings : defaultDatePickerStrings}
                    label={strings.StartDate}
                    value={startDate}
                    formatDate={(date) => (date ? format(date, dateFormat) : '')}
                    onSelectDate={(date) => setStartDate(date ?? undefined)}
                />
                <DatePicker
                    strings={props.locale === 'et-ee' ? datePickerStrings : defaultDatePickerStrings}
                    label={strings.EndDate}
                    value={endDate}
                    formatDate={(date) => (date ? format(date, dateFormat) : '')}
                    onSelectDate={(date) => setEndDate(date ?? undefined)}
                />
                <ColorPicker
                    onChange={(_, color) => setColor(color)}
                    color={color ?? ''}
                    showPreview={false}
                    alphaType={'none'}
                />
            </div>
            <div className={styles.modalFooter}>
                <PrimaryButton
                    disabled={!title || !startDate || !endDate || !color || props.isAdding}
                    onRenderText={() =>
                        props.isAdding ? (
                            <span className={styles.spinnerText}>
                                <Spinner size={SpinnerSize.small} />
                                {strings.AddTask}
                            </span>
                        ) : (
                            <span>{strings.AddTask}</span>
                        )
                    }
                    onClick={async () => {
                        if (!title || !startDate || !endDate || !color) {
                            return;
                        }
                        await props.addTask({
                            Title: title,
                            StartDate: startDate,
                            EndDate: endDate,
                            Color: `#${color?.hex}` || ''
                        });
                    }}
                />
                <DefaultButton text={strings.Cancel} onClick={props.hideModal} />
            </div>
        </Modal>
    );
}
