import type { CourseScheduleItem } from '~/lib/containers/course/types';

export type ScheduleDisplayItem = {
	id: string;
	label: string;
	badge: { day: string; month: string };
	day: string;
	durationLabel: string;
	timeRange: string;
	startDate: Date;
};

const defaultStartTime = { hours: 19, minutes: 30 };

const parseTimeOfDay = (value?: string) => {
	if (!value) {
		return null;
	}

	const timeMatch = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
	if (!timeMatch) {
		return null;
	}

	const rawHours = Number(timeMatch[1]);
	const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0;
	const meridiem = timeMatch[3].toUpperCase();
	const hours = meridiem === 'PM' && rawHours !== 12 ? rawHours + 12 : meridiem === 'AM' && rawHours === 12 ? 0 : rawHours;
	return { hours, minutes };
};

const monthMap: Record<string, number> = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11
};

const parseDate = (value?: string) => {
	if (!value) {
		return null;
	}

	const dateMatch = value.match(/(\d{1,2})\s+([A-Za-z]{3,})/);
	if (!dateMatch) {
		return null;
	}

	const day = Number(dateMatch[1]);
	const monthKey = dateMatch[2].slice(0, 3).toLowerCase();
	const monthIndex = monthMap[monthKey];
	if (Number.isNaN(day) || monthIndex === undefined) {
		return null;
	}

	const now = new Date();
	return new Date(now.getFullYear(), monthIndex, day);
};

const isPastDate = (value: Date, today: Date) => {
	const dateOnly = new Date(value.getFullYear(), value.getMonth(), value.getDate());
	const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	return dateOnly < todayOnly;
};

const getNextSaturday = (fromDate: Date) => {
	const date = new Date(fromDate);
	const day = date.getDay();
	const daysUntil = (6 - day + 7) % 7;
	const offset = daysUntil === 0 ? 7 : daysUntil;
	date.setDate(date.getDate() + offset);
	return date;
};

const getWeekendDate = (baseSaturday: Date, index: number) => {
	const weekOffset = Math.floor(index / 2) * 7;
	const dayOffset = index % 2;
	const date = new Date(baseSaturday);
	date.setDate(baseSaturday.getDate() + weekOffset + dayOffset);
	return date;
};

const parseDurationMinutes = (value?: string) => {
	if (!value) {
		return null;
	}

	const hoursMatch = value.match(/(\d+)\s*h/i) ?? value.match(/(\d+)\s*hour/i);
	const minutesMatch = value.match(/(\d+)\s*m/i) ?? value.match(/(\d+)\s*min/i);
	const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
	const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
	const total = hours * 60 + minutes;
	return total > 0 ? total : null;
};

const formatDurationLabel = (minutes: number) => {
	if (minutes % 60 === 0) {
		const hours = minutes / 60;
		return `${hours} Hour${hours === 1 ? '' : 's'}`;
	}

	if (minutes < 60) {
		return `${minutes} Min`;
	}

	const hours = Math.floor(minutes / 60);
	const remaining = minutes % 60;
	return `${hours}h ${remaining}m`;
};

const formatTime = (date: Date) =>
	date.toLocaleTimeString('en-IN', {
		hour: 'numeric',
		minute: '2-digit'
	});

const formatDateBadge = (date: Date) => ({
	day: date.getDate().toString().padStart(2, '0'),
	month: date.toLocaleDateString('en-IN', { month: 'short' })
});

export const buildScheduleDisplayItems = (
	items: CourseScheduleItem[],
	durationHours: number,
	durationMinutes: number
): ScheduleDisplayItem[] => {
	if (!items.length) {
		return [];
	}

	const today = new Date();
	const initialTime = items.map(item => parseTimeOfDay(item.time)).find(Boolean) ?? defaultStartTime;
	const shouldAutoSchedule = items.some(item => {
		const parsedDate = parseDate(item.time);
		return !parsedDate || isPastDate(parsedDate, today);
	});
	const baseSaturday = getNextSaturday(today);
	const fallbackDuration = durationHours * 60 + durationMinutes;

	return items.map((item, index) => {
		const parsedDate = parseDate(item.time);
		const timeOfDay = parseTimeOfDay(item.time) ?? initialTime;
		const durationMinutesValue =
			parseDurationMinutes(item.duration) ?? (fallbackDuration > 0 ? fallbackDuration : 90);
		const date =
			shouldAutoSchedule || !parsedDate || isPastDate(parsedDate, today)
				? getWeekendDate(baseSaturday, index)
				: parsedDate;
		const start = new Date(date);
		start.setHours(timeOfDay.hours, timeOfDay.minutes, 0, 0);
		const end = new Date(start);
		end.setMinutes(end.getMinutes() + durationMinutesValue);
		const badge = formatDateBadge(start);
		return {
			id: item.id,
			label: item.label,
			badge,
			day: start.toLocaleDateString('en-IN', { weekday: 'long' }),
			durationLabel: formatDurationLabel(durationMinutesValue),
			timeRange: `${formatTime(start)} to ${formatTime(end)}`,
			startDate: start
		};
	});
};
