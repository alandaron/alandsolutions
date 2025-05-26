import { IDatePickerStrings } from '@fluentui/react';

export const months: string[] = [
    'Jaanuar',
    'Veebruar',
    'Märts',
    'Aprill',
    'Mai',
    'Juuni',
    'Juuli',
    'August',
    'September',
    'Oktoober',
    'November',
    'Detsember'
];

// tslint:disable-next-line
export const datePickerStrings: IDatePickerStrings = {
    shortDays: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
    goToToday: 'Täna',
    months: months,
    shortMonths: ['Jaan', 'Veebr', 'Märts', 'Apr', 'Mai', 'Juuni', 'Juuli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dets'],
    days: ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev']
};
