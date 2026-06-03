export type RawSseMessage = {
  event: string;
  data: string;
};

export function createSseDecoder(onMessage: (message: RawSseMessage) => void) {
  let buffer = "";

  function emit(raw: string) {
    const normalized = raw.replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    let event = "message";
    const data: string[] = [];

    for (const line of lines) {
      if (!line || line.startsWith("#")) {
        continue;
      }
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim();
      }
      if (line.startsWith("data:")) {
        data.push(line.slice("data:".length).trimStart());
      }
    }

    if (data.length > 0) {
      onMessage({ event, data: data.join("\n") });
    }
  }

  return {
    push(chunk: string) {
      buffer += chunk;
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        emit(raw);
        boundary = buffer.indexOf("\n\n");
      }
    },
    flush() {
      if (buffer.trim().length > 0) {
        emit(buffer);
      }
      buffer = "";
    }
  };
}
