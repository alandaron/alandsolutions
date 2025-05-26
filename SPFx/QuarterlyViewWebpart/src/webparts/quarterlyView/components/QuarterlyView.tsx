import * as React from 'react';
import styles from './QuarterlyView.module.scss';
import type { IQuarterlyViewProps } from './IQuarterlyViewProps';
import { IconButton, PrimaryButton, Spinner, SpinnerSize, TooltipHost } from '@fluentui/react';
import {
    addMonths,
    addWeeks,
    compareAsc,
    eachDayOfInterval,
    endOfQuarter,
    endOfWeek,
    format,
    getISOWeek,
    getMonth,
    getQuarter,
    getYear,
    isBefore,
    isWithinInterval,
    startOfQuarter,
    startOfWeek
} from 'date-fns';
import { dateFormat, monthFormat } from '../constants/DateTime';
import * as strings from 'QuarterlyViewWebPartStrings';
import { ITaskListItem } from '../models/listItems/ITaskListItem';
import { IMonthData } from '../models/IMonthData';
import AddTaskModal from './AddTaskModal/AddTaskModal';
import { MAX_TASKS_COUNT } from '../constants/MaxTasksCount';

export default function QuarterlyView(props: IQuarterlyViewProps): React.ReactElement<IQuarterlyViewProps> {
    const [quarter, setQuarter] = React.useState<number>(getQuarter(new Date()));
    const [year, setYear] = React.useState<number>(getYear(new Date()));
    const [tasks, setTasks] = React.useState<ITaskListItem[]>([]);
    const [addTaskModalVisible, setAddTaskModalVisible] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isAdding, setIsAdding] = React.useState<boolean>(false);
    const [tasksCount, setTasksCount] = React.useState<number>(0);

    const getBarStyle = (
        fillWeek: boolean,
        isTaskStartWeek: boolean,
        isTaskEndWeek: boolean,
        taskColor: string
    ): React.CSSProperties => {
        if (!fillWeek) {
            return {};
        }

        let borderRadius = 'none';
        if (isTaskStartWeek && isTaskEndWeek) {
            borderRadius = '32px';
        } else if (isTaskStartWeek) {
            borderRadius = '32px 0px 0px 32px';
        } else if (isTaskEndWeek) {
            borderRadius = '0px 32px 32px 0px';
        }

        return {
            backgroundColor: taskColor,
            border: 'none',
            borderRadius: borderRadius,
            height: 16,
            zIndex: 2,
            top: '25%',
            position: 'absolute',
            width: isTaskEndWeek ? '100%' : '110%'
        };
    };

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

    const getMonthByMostDaysInWeek = (weekStart: Date, weekEnd: Date): number => {
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const daysCountByMonth: Record<number, number> = {};

        days.forEach((day) => {
            const month = getMonth(day);
            if (!daysCountByMonth[month]) {
                daysCountByMonth[month] = 0;
            }
            daysCountByMonth[month]++;
        });

        let maxDays = 0;
        let monthWithMostDays = 0;
        for (const month in daysCountByMonth) {
            if (daysCountByMonth[month] > maxDays) {
                maxDays = daysCountByMonth[month];
                monthWithMostDays = parseInt(month);
            }
        }

        return monthWithMostDays;
    };

    const getQuarterWeeksGroupedByMonth = (quarterDate: Date): IMonthData[] => {
        const quarterStart = startOfQuarter(quarterDate);
        const quarterEnd = endOfQuarter(quarterDate);

        const start = startOfWeek(startOfQuarter(quarterDate), { weekStartsOn: 1 });

        const allowedMonths = [
            getMonth(quarterStart),
            getMonth(addMonths(quarterStart, 1)),
            getMonth(addMonths(quarterStart, 2))
        ];
        const monthMap: Record<number, IMonthData> = {};
        let current = start;

        while (isBefore(current, quarterEnd) || current.getTime() === quarterEnd.getTime()) {
            const weekStart = current;
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const isoWeek = getISOWeek(weekStart);

            const monthIndex = getMonthByMostDaysInWeek(weekStart, weekEnd);
            if (!monthMap[monthIndex]) {
                monthMap[monthIndex] = {
                    month: format(new Date(quarterDate.getFullYear(), monthIndex, 1), monthFormat),
                    weeks: []
                };
            }

            if (!monthMap[monthIndex].weeks.some((w) => w.weekNumber === isoWeek)) {
                monthMap[monthIndex].weeks.push({
                    weekNumber: isoWeek,
                    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
                    end: endOfWeek(weekStart, { weekStartsOn: 1 })
                });
            }

            current = addWeeks(current, 1);
        }

        return Object.entries(monthMap)
            .filter(([monthIndex]) => allowedMonths.includes(Number(monthIndex)))
            .map(([_, monthData]) => monthData);
    };

    const checkTasksCount = async (): Promise<void> => {
        try {
            const getTasksCount = await props.api.getTasksCount();
            setTasksCount(getTasksCount);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    };

    const fetchTasksForQuarter = async (year: number, quarter: number): Promise<void> => {
        const quarterDate = getQuarterDate(year, quarter);
        const startDate = startOfQuarter(quarterDate);
        const endDate = endOfQuarter(quarterDate);
        setIsLoading(true);

        try {
            const tasks: ITaskListItem[] = await props.api.getTasksByStartAndEndDate(startDate, endDate);
            const visibleWeeks = getQuarterWeeksGroupedByMonth(quarterDate).flatMap((month) => month.weeks);

            const filteredTasks = tasks
                .filter((task) =>
                    visibleWeeks.some(
                        (week) => new Date(task.StartDate) <= week.end && new Date(task.EndDate) >= week.start
                    )
                )
                .sort((a, b) => compareAsc(new Date(a.StartDate), new Date(b.StartDate)));
            setTasks(
                filteredTasks.map((task) => ({
                    ...task,
                    StartDate: new Date(task.StartDate),
                    EndDate: new Date(task.EndDate)
                }))
            );
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = async (task: ITaskListItem): Promise<void> => {
        try {
            setIsAdding(true);
            await props.api.addTask(task);
            setIsAdding(false);

            setIsLoading(true);
            await checkTasksCount();
            await fetchTasksForQuarter(year, quarter);
            setIsLoading(false);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        } finally {
            setAddTaskModalVisible(false);
        }
    };

    React.useEffect(() => {
        // eslint-disable-next-line no-void
        void fetchTasksForQuarter(year, quarter);
    }, [year, quarter]);

    React.useEffect(() => {
        // eslint-disable-next-line no-void
        void checkTasksCount();
    }, []);

    return (
        <div className={styles.quarterlyViewWrapper}>
            <div className={styles.quarterlyView}>
                <div className={styles.header}>
                    <PrimaryButton
                        disabled={tasksCount === MAX_TASKS_COUNT}
                        iconProps={{ iconName: 'Add' }}
                        text={strings.AddTask}
                        onClick={() => setAddTaskModalVisible(true)}
                    />
                    <span>
                        <IconButton iconProps={{ iconName: 'ChevronLeft' }} onClick={goToPreviousQuarter} />
                        <span>
                            {strings.QuarterTitle.replace('$quarter', quarter.toString()).replace(
                                '$year',
                                year.toString()
                            )}
                        </span>
                        <IconButton iconProps={{ iconName: 'ChevronRight' }} onClick={goToNextQuarter} />
                    </span>
                </div>
                {tasks.length === 0 && isLoading && (
                    <div className={styles.spinnerOverlay}>
                        <Spinner size={SpinnerSize.medium} />
                    </div>
                )}

                <div className={styles.table} style={tasks.length === 0 ? { minHeight: '100px' } : {}}>
                    <div className={styles.tasks}>
                        <div>{strings.Tasks}</div>
                        {tasks.map((task) => (
                            <div key={task.Id}>{task.Title}</div>
                        ))}
                        {tasks.length === 0 && <div className={styles.noTasks}>{strings.NoTasks}</div>}
                    </div>
                    <div className={styles.startDate}>
                        <div>{strings.StartDate}</div>
                        {tasks.map((task) => (
                            <div key={task.Id}>{format(task.StartDate, dateFormat)}</div>
                        ))}
                    </div>
                    <div className={styles.endDate}>
                        <div>{strings.EndDate}</div>
                        {tasks.map((task) => (
                            <div key={task.Id}>{format(task.EndDate, dateFormat)}</div>
                        ))}
                    </div>
                    {getQuarterWeeksGroupedByMonth(getQuarterDate(year, quarter)).map((monthData) => (
                        <div className={styles.month} key={monthData.month}>
                            <div className={styles.monthTitle}> {monthData.month}</div>
                            <div className={styles.weeks}>
                                {monthData.weeks.map((week) => (
                                    <div key={week.weekNumber}>{week.weekNumber}</div>
                                ))}
                            </div>
                            {tasks.map((task) => (
                                <div key={task.Id} className={styles.timeline}>
                                    {monthData.weeks.map((week) => {
                                        const tooltipId = 'tooltip' + task.Id;
                                        const fillWeek = task.StartDate <= week.end && task.EndDate >= week.start;
                                        const isTaskStartWeek = isWithinInterval(task.StartDate, {
                                            start: week.start,
                                            end: week.end
                                        });
                                        const isTaskEndWeek = isWithinInterval(task.EndDate, {
                                            start: week.start,
                                            end: week.end
                                        });

                                        return (
                                            <div className={styles.week} key={week.weekNumber}>
                                                <TooltipHost
                                                    content={`${format(task.StartDate, dateFormat)} - ${format(
                                                        task.EndDate,
                                                        dateFormat
                                                    )}`}
                                                    id={tooltipId}
                                                >
                                                    <div
                                                        className={styles.bar}
                                                        style={getBarStyle(
                                                            fillWeek,
                                                            isTaskStartWeek,
                                                            isTaskEndWeek,
                                                            task.Color
                                                        )}
                                                    />
                                                </TooltipHost>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {addTaskModalVisible && (
                <AddTaskModal
                    locale={props.locale}
                    isAdding={isAdding}
                    addTask={(task) => addTask(task)}
                    hideModal={() => setAddTaskModalVisible(false)}
                />
            )}
        </div>
    );
}
