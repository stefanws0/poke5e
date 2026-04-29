import { test, expect, vi, beforeEach, afterEach } from "vitest"
import { get } from "svelte/store"
import { waitForStore } from "$lib/test/store"
import { stubEvolutionJsonResponse, stubSingleEvolutionJsonResponse } from "./stubs"
import { EvolutionStore } from "../EvolutionStore"
import { SpeciesIdentifier } from "$lib/poke5e/species"
import { EvolutionForest } from "../EvolutionForest"
import { ApiStub } from "$lib/test/ApiStub"

beforeEach(async () => {
	const eeveeToFlareon = stubSingleEvolutionJsonResponse({
		from: "eevee",
		to: "flareon",
		conditions: [ {
			type: "level",
			value: 6,
		} ],
	})

	const evolutions = stubEvolutionJsonResponse(eeveeToFlareon)
	ApiStub.evolutions = evolutions
})

afterEach(() => {
	vi.resetAllMocks()
})

test("getting the evolutions for a regular pokemon", async () => {
	const id = SpeciesIdentifier.fromSpeciesName("eevee")

	const storedValue = await waitForSpecies(id)
	const eeveeEvo = storedValue.evolvesTo(id)

	expect(eeveeEvo[0].to.data).toEqual("flareon")
})

function waitForSpecies(species: SpeciesIdentifier): Promise<EvolutionForest> {
	return waitForStore<EvolutionForest>(EvolutionStore.get(species))
}

function waitForAll(): Promise<EvolutionForest> {
	return waitForStore<EvolutionForest>(EvolutionStore.all())
}
