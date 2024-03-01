export type WithId<T> = T & {
	id: number;
}

export type WithOptionalId<T> = T | WithId<T>;