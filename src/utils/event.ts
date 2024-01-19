export class EventEmitter<T = void> {
  private listeners = new Set<(data: T) => void>();

  emit(data: T) {
    this.listeners.forEach((f) => f(data));
  }

  listen(fn: (data: T) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
