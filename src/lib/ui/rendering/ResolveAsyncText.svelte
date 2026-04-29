<!--
	Syntax:
	* {{TYPE:ID}} -> render the thing's name
	* {{TYPE::ID}} -> render the thing's as a link
-->
<script lang="ts">
	import { onDestroy, onMount } from "svelte"
	import { PokemonSpecies, SpeciesStore } from "$lib/poke5e/species"
	import { LoaderInline } from "$lib/ui/elements"
	import { MovesStore } from "$lib/moves/store"
	import { AbilityStore } from "$lib/pokemon/ability"
	import { Url } from "$lib/site/url"
	import { type Unsubscriber } from "svelte/store"
	import DomPurify from "dompurify"

	let species: PokemonSpecies[] = []
	let unsubscribe: Unsubscriber

	onMount(() => {
		unsubscribe = SpeciesStore.list().subscribe((s) => {
			species = s
		})
	})

	onDestroy(() => {
		unsubscribe?.()
	})
	
	export let value: string

	$: toRender = value
		.replaceAll(/{{pokemon:(:?)(.*?)}}/g, (_, link, id) => {
			const pokemon = species?.find((it) => it.id.data === id)
			return link !== "" ? `<a href="${Url.pokemon(id)}">${pokemon?.name ?? id}</a>` : (pokemon?.name ?? id)
		})
		.replaceAll(/{{move:(:?)(.*?)}}/g, (_, link, id) => link !== "" ? `<a href="${Url.moves(id)}">${$MovesStore?.find((it) => it.id === id)?.name}</a>` : $MovesStore?.find((it) => it.id === id)?.name)
		.replaceAll(/{{ability:(:?)(.*?)}}/g, (_, link, id) => link !== "" ? `<a href="${Url.reference.abilities()}#${id}">${$AbilityStore?.find((it) => it.referenceId === id)?.name}</a>` : $AbilityStore?.find((it) => it.referenceId === id)?.name)

	$: sanitized = DomPurify.sanitize(toRender, {
		FORBID_TAGS: ["style", "script"],
	})
</script>

{@html sanitized}
