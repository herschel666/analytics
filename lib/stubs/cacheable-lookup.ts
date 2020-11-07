export default class {
  lookup(_: unknown, callback: (err: Error) => unknown): void {
    callback(new Error('Do not call the "lookup"-method'));
  }
}
