import { get } from "svelte/store"
import { PokemonSpecies, SpeciesStore } from "$lib/poke5e/species"
import type { PageLoad } from "./$types"
import { Url } from "$lib/site/url"
import type { SinglePokemonJsonResponse } from "$lib/poke5e/species/PokemonJsonResponse"

export const load: PageLoad = async ({ fetch }) => {
	const cached = get(SpeciesStore.list())

	if (cached != null && cached.length > 0) {
		return { pokemonList: cached }
	}

	const pokemon = await fetch(Url.api.pokemon())
		.then(res => res.json())
		.then((data) => Promise.all(data.items.map((it: SinglePokemonJsonResponse) => 
			PokemonSpecies.fromJson(it),
		)))

	return { pokemonList: pokemon }
}
