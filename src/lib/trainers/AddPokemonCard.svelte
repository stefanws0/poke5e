<script lang="ts">
	import { Card } from "$lib/ui/page"
	import { Button } from "$lib/ui/elements"
	import type { TrainerStore } from "./trainers"
	import { goto } from "$app/navigation"
	import { Title } from "$lib/ui/layout"
	import { PokemonSpecies, SpeciesField } from "$lib/poke5e/species"
	import type { Readable } from "svelte/store"
	import { Url } from "$lib/site/url"

	export let trainer: TrainerStore
	export let allSpecies: Readable<PokemonSpecies[]>
	$: canAdd = $trainer.update != null
	$: readKey = $trainer.info.readKey

	let saving = false
	const onSelect = (p: PokemonSpecies) => () => {
		saving = true
		$trainer.update?.addToTeam(p).then(({ id }) => {
			goto(Url.trainers(readKey, id))
		}).catch(() => {
			saving = false
		})
	}
</script>

<Title value="Add Pokemon" />
<Card title="Add to {$trainer.info.name}'s team">
	{#if canAdd}
		<section>
			<p>Start typing the pokemon's species, then select from the provided list.</p>
			<div class="font-lg">
				<SpeciesField label="Species" value="" name="species" allSpecies={$allSpecies} disabled={saving} on:change={(e) => onSelect(e.detail.species)()} explicitSubmit required />
			</div>
		</section>
	{:else}
		<section>
			<p>You do not have permission to add pokemon to this trainer.</p>
		</section>
	{/if}
</Card>

<style>
	.font-lg {
		font-size: var(--font-sz-neptune);
	}

	.min-height {
		min-block-size: 5em;
	}
</style>