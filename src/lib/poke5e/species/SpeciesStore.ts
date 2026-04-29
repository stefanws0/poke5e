import { derived, type Readable, type Unsubscriber } from "svelte/store"
import { PokemonSpecies } from "./PokemonSpecies"
import type { SpeciesIdentifier } from "./SpeciesIdentifier"
import type { PokemonJsonResponse } from "./PokemonJsonResponse"
import type { Data } from "$lib/DataClass"
import { cachedReadable } from "$lib/utils/store"
import { Url } from "$lib/site/url"

export const pokemonSpecies = cachedReadable<PokemonSpecies[]>([], (set) => {
	if (typeof window !== "undefined") {
		fetch(Url.api.pokemon())
			.then((res) => res.json())
			.then((data: PokemonJsonResponse) => Promise.all(data.items.map((it) =>
				PokemonSpecies.fromJson(it)
			)))
			.then((pokemon) => set(pokemon))
	}
})

export type StoredSpecies = Record<Data<SpeciesIdentifier>, SingleStoredSpecies>

export type SingleStoredSpecies = {
	value: PokemonSpecies,
}

export type SingleSpeciesStore = {
	subscribe: (run: (value: SingleStoredSpecies | undefined) => void) => Unsubscriber
}

export interface SpeciesStore {
	get: (id: SpeciesIdentifier) => Promise<SingleSpeciesStore | undefined>
	list: () => Readable<PokemonSpecies[]>
	asyncList: () => Promise<Readable<PokemonSpecies[]>>
}

function createStore(): SpeciesStore {
	return {
		get: async (id: SpeciesIdentifier): Promise<SingleSpeciesStore | undefined> => {
			return derived(pokemonSpecies, (pokemonSpecies) => {
				const found = pokemonSpecies?.find((it) => it.id.data === id.data)
				if (found == null) return undefined
				return {
					value: found,
				}
			})
		},
		list: () => {
			return pokemonSpecies
		},
		asyncList: async () => {
			return pokemonSpecies
		},
	}
}

export const SpeciesStore = createStore()
