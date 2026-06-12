export class TranslateWordInContextQuery {
  constructor(
    public readonly word: string,
    public readonly sentence: string
  ) {}
}
