import { test, expect, vi, beforeEach, afterEach } from "vitest"
import { pokemonSpecies, SpeciesStore } from "../SpeciesStore"
import { SpeciesIdentifier } from "../SpeciesIdentifier"
import { get } from "svelte/store"
import { stubPokemonJsonResponse, stubPokemonSpecies, stubSinglePokemonJsonResponse } from "./stubs"
import { waitForStore } from "$lib/test/store"
import { ApiStub } from "$lib/test/ApiStub"

beforeEach(async () => {
	const eevee = stubSinglePokemonJsonResponse({
		id: "eevee",
		name: "Eevee",
	})

	const pokemon = stubPokemonJsonResponse(eevee)
	ApiStub.pokemon = pokemon

	await waitForStore(pokemonSpecies)
})

afterEach(() => {
	vi.resetAllMocks()
})

test("getting a regular pokemon", async () => {
	const id = SpeciesIdentifier.fromSpeciesName("eevee")

	const singleStore = await SpeciesStore.get(id)
	expect(singleStore).toBeDefined()

	const storedValue = get(singleStore!)
	expect(storedValue?.value.data.name).toEqual("Eevee")
})

test("regular pokemon does not exist", async () => {
	const id = SpeciesIdentifier.fromSpeciesName("uhoh")

	const singleStore = await SpeciesStore.get(id)
	if (singleStore == null) {
		expect(singleStore).toBeUndefined()
		return
	}

	const storedValue = get(singleStore)
	expect(storedValue).toBe(undefined)
})