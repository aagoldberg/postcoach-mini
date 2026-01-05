import type { Cast, ThemeCluster, CastMetrics } from '@/types';
import { kmeans } from 'ml-kmeans';

// Stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
  'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
  'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'would', 'should', 'could', 'ought', 'im', 'ive', 'id', 'ill', 'youre',
  'youve', 'youd', 'youll', 'hes', 'shes', 'its', 'were', 'theyve', 'theyd',
  'theyll', 'wont', 'dont', 'didnt', 'cant', 'couldnt', 'shouldnt', 'wouldnt',
  'isnt', 'arent', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'doesnt',
  'just', 'now', 'also', 'only', 'then', 'than', 'so', 'very', 'too', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'same', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'why',
  'here', 'there', 'when', 'where', 'again', 'further', 'once', 'really',
  'like', 'get', 'got', 'getting', 'going', 'go', 'goes', 'gone', 'make',
  'makes', 'made', 'making', 'take', 'takes', 'took', 'taking', 'come',
  'comes', 'came', 'coming', 'know', 'knows', 'knew', 'knowing', 'think',
  'thinks', 'thought', 'thinking', 'see', 'sees', 'saw', 'seeing', 'want',
  'wants', 'wanted', 'wanting', 'use', 'uses', 'used', 'using', 'find',
  'finds', 'found', 'finding', 'give', 'gives', 'gave', 'giving', 'tell',
  'tells', 'told', 'telling', 'let', 'lets', 'feel', 'feels', 'felt',
  'feeling', 'try', 'tries', 'tried', 'trying', 'leave', 'leaves', 'left',
  'leaving', 'call', 'calls', 'called', 'calling', 'keep', 'keeps', 'kept',
  'keeping', 'seem', 'seems', 'seemed', 'seeming', 'help', 'helps', 'helped',
  'helping', 'show', 'shows', 'showed', 'showing', 'hear', 'hears', 'heard',
  'hearing', 'play', 'plays', 'played', 'playing', 'run', 'runs', 'ran',
  'running', 'move', 'moves', 'moved', 'moving', 'live', 'lives', 'lived',
  'living', 'work', 'works', 'worked', 'working', 'read', 'reads', 'reading',
  'last', 'long', 'great', 'little', 'own', 'old', 'right', 'big', 'high',
  'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'public', 'bad', 'good', 'new', 'first', 'day', 'time', 'year', 'way',
  'thing', 'man', 'world', 'life', 'hand', 'part', 'child', 'eye', 'woman',
  'place', 'case', 'week', 'company', 'system', 'program', 'question',
  'government', 'number', 'night', 'point', 'home', 'water', 'room',
  'mother', 'area', 'money', 'story', 'fact', 'month', 'lot', 'study',
  'book', 'job', 'word', 'business', 'issue', 'side', 'kind', 'head',
  'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line',
  'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president',
  'team', 'minute', 'idea', 'kid', 'body', 'information', 'back', 'parent',
  'face', 'others', 'level', 'office', 'door', 'health', 'person', 'art',
  'war', 'history', 'party', 'result', 'change', 'morning', 'reason', 'research',
]);

/**
 * Tokenize text into words, removing stop words and short words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[^a-zA-Z\s]/g, ' ') // Remove non-letters
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Build vocabulary from all casts
 */
function buildVocabulary(casts: Cast[]): Map<string, number> {
  const wordCounts = new Map<string, number>();

  for (const cast of casts) {
    const words = tokenize(cast.text);
    const uniqueWords = new Set(words);

    for (const word of uniqueWords) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }

  // Filter to words that appear in at least 2 documents but not more than 80%
  const minDocs = 2;
  const maxDocs = Math.ceil(casts.length * 0.8);

  const vocabulary = new Map<string, number>();
  let idx = 0;

  for (const [word, count] of wordCounts) {
    if (count >= minDocs && count <= maxDocs) {
      vocabulary.set(word, idx++);
    }
  }

  return vocabulary;
}

/**
 * Convert text to TF-IDF vector
 */
function textToTfIdf(
  text: string,
  vocabulary: Map<string, number>,
  documentFrequencies: Map<string, number>,
  totalDocs: number
): number[] {
  const words = tokenize(text);
  const vector = new Array(vocabulary.size).fill(0);

  // Count term frequencies
  const termFreqs = new Map<string, number>();
  for (const word of words) {
    if (vocabulary.has(word)) {
      termFreqs.set(word, (termFreqs.get(word) || 0) + 1);
    }
  }

  // Calculate TF-IDF
  for (const [word, tf] of termFreqs) {
    const idx = vocabulary.get(word);
    if (idx !== undefined) {
      const df = documentFrequencies.get(word) || 1;
      const idf = Math.log(totalDocs / df);
      vector[idx] = tf * idf;
    }
  }

  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

/**
 * Compute TF-IDF vectors for all casts
 */
function computeTfIdfVectors(
  casts: Cast[],
  vocabulary: Map<string, number>
): { vectors: number[][]; documentFrequencies: Map<string, number> } {
  // Calculate document frequencies
  const documentFrequencies = new Map<string, number>();

  for (const cast of casts) {
    const words = new Set(tokenize(cast.text));
    for (const word of words) {
      if (vocabulary.has(word)) {
        documentFrequencies.set(word, (documentFrequencies.get(word) || 0) + 1);
      }
    }
  }

  // Compute vectors
  const vectors = casts.map((cast) =>
    textToTfIdf(cast.text, vocabulary, documentFrequencies, casts.length)
  );

  return { vectors, documentFrequencies };
}

/**
 * Extract top keywords from a cluster
 */
function extractClusterKeywords(
  clusterVectors: number[][],
  vocabulary: Map<string, number>,
  topK: number = 5
): string[] {
  if (clusterVectors.length === 0) return [];

  // Calculate centroid
  const dims = clusterVectors[0].length;
  const centroid = new Array(dims).fill(0);

  for (const vector of clusterVectors) {
    for (let i = 0; i < dims; i++) {
      centroid[i] += vector[i];
    }
  }

  for (let i = 0; i < dims; i++) {
    centroid[i] /= clusterVectors.length;
  }

  // Get top dimensions
  const indexedCentroid = centroid.map((val, idx) => ({ val, idx }));
  indexedCentroid.sort((a, b) => b.val - a.val);

  // Map back to words
  const reverseVocab = new Map<number, string>();
  for (const [word, idx] of vocabulary) {
    reverseVocab.set(idx, word);
  }

  const keywords: string[] = [];
  for (let i = 0; i < Math.min(topK, indexedCentroid.length); i++) {
    const word = reverseVocab.get(indexedCentroid[i].idx);
    if (word && indexedCentroid[i].val > 0) {
      keywords.push(word);
    }
  }

  return keywords;
}

/**
 * Cluster casts by topic using TF-IDF + K-means
 */
export function clusterCasts(
  casts: Cast[],
  metricsMap: Map<string, CastMetrics>,
  numClusters: number = 5
): { clusters: ThemeCluster[]; castToCluster: Map<string, number> } {
  if (casts.length < numClusters) {
    // Not enough casts to cluster meaningfully
    return {
      clusters: [{
        id: 0,
        label: 'All Posts',
        description: 'All your recent casts',
        castHashes: casts.map((c) => c.hash),
        avgEngagement: casts.reduce((sum, c) =>
          sum + (metricsMap.get(c.hash)?.engagementScore ?? 0), 0) / casts.length,
        sampleTexts: casts.slice(0, 3).map((c) => c.text.slice(0, 100)),
      }],
      castToCluster: new Map(casts.map((c) => [c.hash, 0])),
    };
  }

  // Build vocabulary
  const vocabulary = buildVocabulary(casts);

  if (vocabulary.size < 10) {
    // Not enough vocabulary for meaningful clustering
    return {
      clusters: [{
        id: 0,
        label: 'Mixed Topics',
        description: 'Your posts cover various topics',
        castHashes: casts.map((c) => c.hash),
        avgEngagement: casts.reduce((sum, c) =>
          sum + (metricsMap.get(c.hash)?.engagementScore ?? 0), 0) / casts.length,
        sampleTexts: casts.slice(0, 3).map((c) => c.text.slice(0, 100)),
      }],
      castToCluster: new Map(casts.map((c) => [c.hash, 0])),
    };
  }

  // Compute TF-IDF vectors
  const { vectors } = computeTfIdfVectors(casts, vocabulary);

  // Filter out empty vectors
  const nonEmptyIndices: number[] = [];
  const nonEmptyVectors: number[][] = [];

  for (let i = 0; i < vectors.length; i++) {
    if (vectors[i].some((v) => v > 0)) {
      nonEmptyIndices.push(i);
      nonEmptyVectors.push(vectors[i]);
    }
  }

  if (nonEmptyVectors.length < numClusters) {
    // Not enough non-empty vectors
    return {
      clusters: [{
        id: 0,
        label: 'Mixed Topics',
        description: 'Your posts cover various topics',
        castHashes: casts.map((c) => c.hash),
        avgEngagement: casts.reduce((sum, c) =>
          sum + (metricsMap.get(c.hash)?.engagementScore ?? 0), 0) / casts.length,
        sampleTexts: casts.slice(0, 3).map((c) => c.text.slice(0, 100)),
      }],
      castToCluster: new Map(casts.map((c) => [c.hash, 0])),
    };
  }

  // Run K-means
  const adjustedK = Math.min(numClusters, Math.floor(nonEmptyVectors.length / 2));
  const result = kmeans(nonEmptyVectors, adjustedK, {
    initialization: 'kmeans++',
    maxIterations: 100,
  });

  // Build cluster assignments
  const castToCluster = new Map<string, number>();
  const clusterCasts = new Map<number, Cast[]>();
  const clusterVectors = new Map<number, number[][]>();

  for (let i = 0; i < nonEmptyIndices.length; i++) {
    const castIdx = nonEmptyIndices[i];
    const clusterId = result.clusters[i];
    const cast = casts[castIdx];

    castToCluster.set(cast.hash, clusterId);

    if (!clusterCasts.has(clusterId)) {
      clusterCasts.set(clusterId, []);
      clusterVectors.set(clusterId, []);
    }
    clusterCasts.get(clusterId)!.push(cast);
    clusterVectors.get(clusterId)!.push(nonEmptyVectors[i]);
  }

  // Assign empty-vector casts to cluster 0
  for (let i = 0; i < casts.length; i++) {
    if (!nonEmptyIndices.includes(i)) {
      castToCluster.set(casts[i].hash, 0);
      if (!clusterCasts.has(0)) {
        clusterCasts.set(0, []);
      }
      clusterCasts.get(0)!.push(casts[i]);
    }
  }

  // Build cluster objects
  const clusters: ThemeCluster[] = [];

  for (const [clusterId, clusterCastsList] of clusterCasts) {
    const keywords = extractClusterKeywords(
      clusterVectors.get(clusterId) || [],
      vocabulary,
      5
    );

    // Calculate average engagement for cluster
    const avgEngagement = clusterCastsList.reduce((sum, c) =>
      sum + (metricsMap.get(c.hash)?.engagementScore ?? 0), 0) / clusterCastsList.length;

    clusters.push({
      id: clusterId,
      label: keywords.length > 0 ? keywords.slice(0, 3).join(', ') : `Topic ${clusterId + 1}`,
      description: '', // Will be filled by LLM
      castHashes: clusterCastsList.map((c) => c.hash),
      avgEngagement,
      sampleTexts: clusterCastsList.slice(0, 5).map((c) => c.text.slice(0, 150)),
    });
  }

  // Sort clusters by engagement
  clusters.sort((a, b) => b.avgEngagement - a.avgEngagement);

  return { clusters, castToCluster };
}

/**
 * Get the top-performing theme
 */
export function getTopTheme(clusters: ThemeCluster[]): ThemeCluster | null {
  if (clusters.length === 0) return null;

  return clusters.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  );
}

/**
 * Get themes sorted by engagement
 */
export function getThemesByEngagement(clusters: ThemeCluster[]): ThemeCluster[] {
  return [...clusters].sort((a, b) => b.avgEngagement - a.avgEngagement);
}
