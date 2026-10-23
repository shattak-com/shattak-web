// This cache is only used for explicitly public JSON in a browser. Never put
// identity, permissions, learning progress, or resource access URLs here.
export class PublicRequestCache {
	private entries = new Map<string, { value: unknown; expiresAt: number }>();
	private pending = new Map<string, Promise<unknown>>();
	private generation = 0;

	constructor(
		private readonly ttlMs = 30_000,
		private readonly maxEntries = 50,
		private readonly now = Date.now
	) {}

	clear() {
		this.generation += 1;
		this.entries.clear();
		this.pending.clear();
	}

	async get<T>(key: string, load: () => Promise<T>): Promise<T> {
		const cached = this.entries.get(key);
		if (cached && cached.expiresAt > this.now()) return structuredClone(cached.value) as T;
		this.entries.delete(key);

		let request = this.pending.get(key) as Promise<T> | undefined;
		if (!request) {
			const { generation } = this;
			request = Promise.resolve()
				.then(load)
				.then(value => {
					if (this.generation === generation) {
						if (this.entries.size >= this.maxEntries) {
							this.entries.delete(this.entries.keys().next().value as string);
						}
						this.entries.set(key, { value: structuredClone(value), expiresAt: this.now() + this.ttlMs });
					}
					return value;
				})
				.finally(() => {
					if (this.pending.get(key) === request) this.pending.delete(key);
				});
			this.pending.set(key, request);
		}
		return structuredClone(await request);
	}
}

export const browserPublicCache = new PublicRequestCache();

export const clearBrowserPublicCache = async () => {
	browserPublicCache.clear();
	if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) return;
	const { controller } = navigator.serviceWorker;
	await new Promise<void>(resolve => {
		const channel = new MessageChannel();
		let timer: ReturnType<typeof setTimeout>;
		const done = () => {
			clearTimeout(timer);
			channel.port1.close();
			resolve();
		};
		timer = setTimeout(done, 300);
		channel.port1.onmessage = done;
		try {
			controller.postMessage({ type: 'SHATTAK_CLEAR_PUBLIC_CACHE' }, [channel.port2]);
		} catch {
			done();
		}
	});
};
