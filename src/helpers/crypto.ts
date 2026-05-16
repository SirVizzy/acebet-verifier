const textEncoder = new TextEncoder();

export const getHashFrom = async (seed: string, algorithm: AlgorithmIdentifier = 'SHA-256') => {
  const messageBuffer = textEncoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest(algorithm, messageBuffer);
  return arrayBufferToHex(hashBuffer);
};

const arrayBufferToHex = (buffer: ArrayBuffer) => {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};
