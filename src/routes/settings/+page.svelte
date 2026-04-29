<script lang="ts">
	import { Card } from "$lib/ui/page"
	import { Page } from "$lib/ui/layout"
	import { Title } from "$lib/ui/layout"
	import { CogIcon } from "$lib/ui/icons"
	import RulesVersionSection from "./RulesVersionSection.svelte"
	import LanguageSection from "./LanguageSection.svelte"
	import { m } from "$lib/site/i18n"
</script>

<Title value="{m["settings.title"]()}" />
<Page theme="grey">
	<CogIcon slot="icon" />
	<Card title="{m["settings.title"]()}">
		<section>
			<p>In this section, you can update preferences and manage backups.</p>
		</section>
		<LanguageSection />
		<RulesVersionSection />
	</Card>
</Page>
