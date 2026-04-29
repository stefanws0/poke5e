import { DataClass } from "$lib/DataClass"

export class SpeciesIdentifier extends DataClass<string> {
	static fromSpeciesName(name: string): SpeciesIdentifier {
		return new SpeciesIdentifier(name)
	}
}
