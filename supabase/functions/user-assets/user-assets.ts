import { DataProvider, PokemonId, TrainerWriteKey } from "./DataProvider"
import { UserAssetsProvider } from "./UserAssetsProvider"

const FIVE_HUNDRED_KB = 524288
function hasValidFileSize(obj: object): boolean {
	return "sizeInBytes" in obj && typeof obj.sizeInBytes === "number" && obj.sizeInBytes <= FIVE_HUNDRED_KB
}

const MimetypeExtensions = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
} as const
function hasValidMimetype(obj: object): boolean {
	return "mimetype" in obj && typeof obj.mimetype === "string" && Object.keys(MimetypeExtensions).includes(obj.mimetype)
}

export type Providers = {
	dataProvider: DataProvider,
	userAssetsProvider: UserAssetsProvider,
}

interface AssetHandler<UploadParams, UploadReturn, RemoveParams> {
	shouldHandle(type: string): boolean
	validateGetUploadUrlParams(params: unknown): params is UploadParams
	getUploadUrl(params: UploadParams): Promise<UploadReturn>
	validateRemoveAssetParams(params: unknown): params is RemoveParams
	removeAsset(params: RemoveParams): Promise<void>
}


type PokemonAvatarHandlerUploadParams = {
	id: PokemonId,
	key: TrainerWriteKey,
	mimetype: keyof typeof MimetypeExtensions,
	sizeInBytes: number,
}
type PokemonAvatarHandlerUploadReturn = {
	filename: string,
	uploadUrl: string,
}
type PokemonAvatarHandlerRemoveParams = {
	id: PokemonId,
	key: TrainerWriteKey,
}
class PokemonAvatarHandler implements AssetHandler<
	PokemonAvatarHandlerUploadParams,
	PokemonAvatarHandlerUploadReturn,
	PokemonAvatarHandlerRemoveParams
> {
	constructor(
		private readonly dataProvider: DataProvider,
		private readonly userAssetsProvider: UserAssetsProvider,
	) {}

	shouldHandle(type: string): boolean {
		return type === "pokemon-avatar"
	}

	validateGetUploadUrlParams(params: unknown): params is PokemonAvatarHandlerUploadParams {
		return params != null &&
			typeof params === "object" &&
			"id" in params &&
			"key" in params &&
			hasValidMimetype(params) &&
			hasValidFileSize(params)
	}

	async getUploadUrl(params: PokemonAvatarHandlerUploadParams): Promise<PokemonAvatarHandlerUploadReturn> {
		const filename = await this.dataProvider.newPokemonAvatarFilename({
			id: params.id,
			key: params.key,
			extension: MimetypeExtensions[params.mimetype],
		})

		const uploadUrl = await this.userAssetsProvider.generatePresignedUploadUrl(filename, params.mimetype, params.sizeInBytes)

		return {
			filename,
			uploadUrl,
		}
	}

	validateRemoveAssetParams(params: unknown): params is PokemonAvatarHandlerRemoveParams {
		return params != null &&
			typeof params === "object" &&
			"id" in params &&
			"key" in params
	}

	async removeAsset(params: PokemonAvatarHandlerRemoveParams): Promise<void> {
		await this.dataProvider.removePokemonAvatar({
			id: params.id,
			key: params.key,
		})
	}
}


function isValidParams(params: unknown): params is {
	type: string,
	params: unknown,
} {
	return params != null && typeof params === "object" && "type" in params && typeof params.type === "string"
}

export async function getUploadUrl({
	dataProvider,
	userAssetsProvider,
// deno-lint-ignore no-explicit-any
}: Providers, params: unknown): Promise<unknown> {
	if (!isValidParams(params)) {
		throw new UserAssetError("`type` is required in request body.")
	}

	// deno-lint-ignore no-explicit-any
	const handlers: AssetHandler<unknown, unknown, unknown>[] = [
		new PokemonAvatarHandler(dataProvider, userAssetsProvider),
	]

	for (const handler of handlers) {
		if (!handler.shouldHandle(params.type)) continue

		if (!handler.validateGetUploadUrlParams(params.params)) {
			throw new UserAssetError("Request body was invalid.")
		}
		return await handler.getUploadUrl(params.params)
	}

	throw new UserAssetError("Invalid asset type")
}

export async function removeAsset({
	dataProvider,
	userAssetsProvider,
}: Providers, params: unknown): Promise<void> {
	if (!isValidParams(params)) {
		throw new UserAssetError("`type` is required in request body.")
	}

	// deno-lint-ignore no-explicit-any
	const handlers: AssetHandler<unknown, unknown, unknown>[] = [
		new PokemonAvatarHandler(dataProvider, userAssetsProvider),
	]

	for (const handler of handlers) {
		if (!handler.shouldHandle(params.type)) continue

		if (!handler.validateRemoveAssetParams(params.params)) {
			throw new UserAssetError("Request body was invalid.")
		}
		return await handler.removeAsset(params.params)
	}

	throw new UserAssetError("Invalid asset type")
}

export class UserAssetError extends Error {
	constructor (message: string) {
		super(message)
	}
}