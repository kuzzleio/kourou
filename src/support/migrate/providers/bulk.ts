const DEFAULT_CHUNK_SIZE = 1000;

/**
 * Splits documents into chunks so a bulk request never exceeds the
 * Elasticsearch "http.max_content_length" limit (100mb by default).
 */
export function* chunkDocuments(
  docs: any[],
  chunkSize = DEFAULT_CHUNK_SIZE,
): Generator<any[]> {
  const size = chunkSize > 0 ? chunkSize : DEFAULT_CHUNK_SIZE;

  for (let i = 0; i < docs.length; i += size) {
    yield docs.slice(i, i + size);
  }
}

/**
 * A bulk request answers with a 200 even when some documents were rejected,
 * so the per-item errors have to be checked explicitly.
 */
export function throwOnBulkErrors(response: any): void {
  if (!response || !response.errors) {
    return;
  }

  const failures = (response.items || [])
    .map((item: any) => item.index || item.create || item.update || item.delete)
    .filter((item: any) => item && item.error);

  if (failures.length === 0) {
    return;
  }

  const [first] = failures;
  const error: any = new Error(
    `${failures.length} document(s) rejected by Elasticsearch. First failure on "${first._id}": ${first.error.type} - ${first.error.reason}`,
  );
  error.errors = failures.map((item: any) => ({
    document: { _id: item._id },
    reason: `${item.error.type} - ${item.error.reason}`,
  }));

  throw error;
}
