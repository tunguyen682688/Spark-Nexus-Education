/**
 * Value Object: Language
 * Represents supported languages in the system
 */
export enum Language {
  ENGLISH = 'en',
  VIETNAMESE = 'vi',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  CHINESE = 'zh',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
}

export class LanguageVO {
  private constructor(private readonly value: Language) {}

  static create(value: string): LanguageVO {
    if (!Object.values(Language).includes(value as Language)) {
      throw new Error(
        `Invalid language: ${value}. Must be one of: ${Object.values(
          Language
        ).join(', ')}`
      );
    }
    return new LanguageVO(value as Language);
  }

  static createEnglish(): LanguageVO {
    return new LanguageVO(Language.ENGLISH);
  }

  static createVietnamese(): LanguageVO {
    return new LanguageVO(Language.VIETNAMESE);
  }

  getValue(): Language {
    return this.value;
  }

  getCode(): string {
    return this.value;
  }

  equals(other: LanguageVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getDisplayName(): string {
    const displayNames: Record<Language, string> = {
      [Language.ENGLISH]: 'English',
      [Language.VIETNAMESE]: 'Tiếng Việt',
      [Language.JAPANESE]: '日本語',
      [Language.KOREAN]: '한국어',
      [Language.CHINESE]: '中文',
      [Language.SPANISH]: 'Español',
      [Language.FRENCH]: 'Français',
      [Language.GERMAN]: 'Deutsch',
    };
    return displayNames[this.value];
  }
}
