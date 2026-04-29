import { type Readable } from "svelte/store"
import { Evolution } from "./Evolution"
import { EvolutionForest } from "./EvolutionForest"
import type { EvolutionJsonResponse } from "./EvolutionJsonResponse"
import { cachedReadable } from "$lib/utils/store"
import { Url } from "../../site/url"

export const evolutions = cachedReadable<EvolutionForest | undefined>(undefined, (set) => {
	if (typeof window !== "undefined") {
		fetch(Url.api.evolutions())
			.then((res) => res.json())
			.then((data: EvolutionJsonResponse) => data.items.map((it) =>
				Evolution.fromJson(it),
			))
			.then((evolution) => evolution.filter((it) => !it.nonCanon))
			.then((evolution) => set(new EvolutionForest(evolution)))
	}
})

export interface EvolutionStore {
	all: () => Readable<EvolutionForest | undefined>
}

function createStore(): EvolutionStore {
	return {
		all: () => evolutions,
	}
}

export const EvolutionStore = createStore()
