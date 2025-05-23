import * as React from 'react';
import styles from './QuarterlyView.module.scss';
import type { IQuarterlyViewProps } from './IQuarterlyViewProps';
import { IconButton } from '@fluentui/react';
import {
    addMonths,
    addWeeks,
    endOfQuarter,
    format,
    getISOWeek,
    getMonth,
    getQuarter,
    getYear,
    isBefore,
    startOfQuarter,
    startOfWeek
} from 'date-fns';
import { monthFormat } from '../constants/DateTime';
import * as strings from 'QuarterlyViewWebPartStrings';
import { ITaskListItem } from '../models/listItems/ITaskListItem';
import { IMonthData } from '../models/IMonthData';

export default function QuarterlyView(props: IQuarterlyViewProps): React.ReactElement<IQuarterlyViewProps> {
    const [quarter, setQuarter] = React.useState<number>(getQuarter(new Date()));
    const [year, setYear] = React.useState<number>(getYear(new Date()));
    const [tasks, setTasks] = React.useState<ITaskListItem[]>([]);

    const goToNextQuarter = (): void => {
        if (quarter === 4) {
            setQuarter(1);
            setYear((prev) => prev + 1);
        } else {
            setQuarter((prev) => prev + 1);
        }
    };

    const goToPreviousQuarter = (): void => {
        if (quarter === 1) {
            setQuarter(4);
            setYear((prev) => prev - 1);
        } else {
            setQuarter((prev) => prev - 1);
        }
    };

    const getQuarterDate = (year: number, quarter: number): Date => {
        const month = (quarter - 1) * 3;
        return new Date(year, month, 1);
    };

    const getQuarterWeeksGroupedByMonth = (quarterDate: Date): IMonthData[] => {
        const quarterStart = startOfQuarter(quarterDate);
        const quarterEnd = endOfQuarter(quarterDate);

        const allowedMonths = [
            getMonth(quarterStart),
            getMonth(addMonths(quarterStart, 1)),
            getMonth(addMonths(quarterStart, 2))
        ];
        const start = startOfWeek(startOfQuarter(quarterDate), { weekStartsOn: 1 });
        const end = endOfQuarter(quarterDate);

        const monthMap: Record<number, IMonthData> = {};
        let current = start;

        while (isBefore(current, quarterEnd) || current.getTime() === end.getTime()) {
            const weekStart = current;
            const isoWeek = getISOWeek(weekStart);

            const monthIndex = getMonth(weekStart);
            if (!allowedMonths.includes(monthIndex)) {
                current = addWeeks(current, 1);
                continue;
            }

            if (!monthMap[monthIndex]) {
                monthMap[monthIndex] = {
                    month: format(weekStart, monthFormat),
                    weeks: []
                };
            }

            if (!monthMap[monthIndex].weeks.includes(isoWeek)) {
                monthMap[monthIndex].weeks.push(isoWeek);
            }

            current = addWeeks(current, 1);
        }

        return Object.values(monthMap);
    };

    const fetchTasksForQuarter = async (year: number, quarter: number): Promise<void> => {
        const quarterDate = getQuarterDate(year, quarter);
        const startDate = startOfQuarter(quarterDate);
        const endDate = endOfQuarter(quarterDate);

        try {
            const tasks: ITaskListItem[] = await props.api.getTasksByStartAndEndDate(startDate, endDate);
            setTasks(tasks);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    };

    React.useEffect(() => {
        // eslint-disable-next-line no-void
        void fetchTasksForQuarter(year, quarter);
    }, [year, quarter]);

    return (
        <div className={styles.quarterlyViewWrapper}>
            <div className={styles.quarterlyView}>
                <div className={styles.header}>
                    <IconButton iconProps={{ iconName: 'ChevronLeft' }} onClick={goToPreviousQuarter} />
                    <span>
                        {strings.QuarterTitle.replace('$quarter', quarter.toString()).replace('$year', year.toString())}
                    </span>
                    <IconButton iconProps={{ iconName: 'ChevronRight' }} onClick={goToNextQuarter} />
                </div>
                <div className={styles.table}>
                    <div className={styles.tasks}>
                        <div>{strings.Tasks}</div>
                        {tasks.map((task) => (
                            <div key={task.Id}>{task.Title}</div>
                        ))}
                    </div>
                    {getQuarterWeeksGroupedByMonth(getQuarterDate(year, quarter)).map((monthData) => (
                        <div className={styles.month} key={monthData.month}>
                            <div className={styles.monthTitle}> {monthData.month}</div>
                            <div className={styles.weeks}>
                                {monthData.weeks.map((week) => (
                                    <div key={week}>{week}</div>
                                ))}
                            </div>
                            {tasks.map((task) => (
                                <div key={task.Id} className={styles.timeline}>
                                    {monthData.weeks.map((week) => {
                                        const fillWeek =
                                            getISOWeek(task.StartDate) <= week && getISOWeek(task.EndDate) >= week;
                                        const isTaskStartWeek = getISOWeek(task.StartDate) === week;
                                        const isTaskEndWeek = getISOWeek(task.EndDate) === week;
                                        return (
                                            <div className={styles.week} key={week}>
                                                <div
                                                    style={
                                                        fillWeek
                                                            ? {
                                                                  backgroundColor: task.Color,
                                                                  border: 'none',
                                                                  borderRadius: isTaskStartWeek
                                                                      ? '32px 0px 0px 32px'
                                                                      : isTaskEndWeek
                                                                      ? '0px 32px 32px 0px'
                                                                      : 'none',
                                                                  height: 16,
                                                                  zIndex: 2,
                                                                  position: 'absolute',
                                                                  width:
                                                                      isTaskStartWeek || isTaskEndWeek ? '100%' : '110%'
                                                              }
                                                            : {}
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
