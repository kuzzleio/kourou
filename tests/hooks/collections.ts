import { Kuzzle } from "kuzzle-sdk";

export async function truncateCollection(
  sdk: Kuzzle,
  index: string,
  collection: string
) {
  if(! await sdk.index.exists(index)){
    await sdk.index.create(index);
  } else {
    await sdk.collection.refresh(index, collection);
    await sdk.document.deleteByQuery(index, collection, {});
  }
}

export async function beforeEachTruncateCollections(sdk: Kuzzle) {
  await Promise.all([
    truncateCollection(sdk, "nyc-open-data", "yellow-taxi"),
  ]);
}
