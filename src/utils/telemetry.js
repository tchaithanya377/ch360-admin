// Telemetry utilities: client headers for observability

const DEVICE_ID_KEY = 'x_device_id';

export const getOrCreateDeviceId = () => {
	try {
		let id = localStorage.getItem(DEVICE_ID_KEY);
		if (!id) {
			id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			localStorage.setItem(DEVICE_ID_KEY, id);
		}
		return id;
	} catch {
		return 'unknown-device';
	}
};

export const shouldSendTelemetryHeaders = () => {
	try {
		// Opt-in via localStorage to avoid CORS during local development
		const flag = localStorage.getItem('enable_telemetry_headers');
		return flag === '1' || flag === 'true';
	} catch {
		return false;
	}
};

export const getTelemetryHeaders = () => {
	if (!shouldSendTelemetryHeaders()) return {};
	let timezone = 'UTC';
	let locale = 'en';
	try {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || timezone;
		locale = navigator.language || locale;
	} catch {}

	return {
		'X-Client-Timezone': timezone,
		'X-Client-Locale': locale,
		'X-Device-Id': getOrCreateDeviceId(),
	};
};

export default {
	getOrCreateDeviceId,
	getTelemetryHeaders,
	shouldSendTelemetryHeaders,
};


