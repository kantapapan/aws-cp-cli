/**
 * AWS認定試験の問題ドメイン（カテゴリ）を表す列挙型
 */
export enum Domain {
  CLOUD_CONCEPTS = "cloud_concepts",
  SECURITY = "security",
  TECHNOLOGY = "technology",
  BILLING = "billing"
}

/**
 * 選択肢のラベルを表す型
 */
export type ChoiceLabel = "A" | "B" | "C" | "D";

/**
 * 問題の選択肢を表すインターフェース
 */
export interface Choices {
  [key: string]: string;
}

/**
 * 問題エンティティクラス
 */
export class Question {
  constructor(
    public readonly id: string,
    public readonly lang: string,
    public readonly domain: Domain,
    public readonly stem: string,
    public readonly choices: Choices,
    public readonly answer: ChoiceLabel,
    public readonly explanation: string,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * 問題データの検証を行う
   * @throws {Error} 検証エラーが発生した場合
   */
  private validate(): void {
    if (!this.id) {
      throw new Error("Question ID is required");
    }

    if (!this.lang) {
      throw new Error("Language is required");
    }

    if (!Object.values(Domain).includes(this.domain)) {
      throw new Error(`Invalid domain: ${this.domain}`);
    }

    if (!this.stem || this.stem.trim().length === 0) {
      throw new Error("Question stem is required");
    }

    if (!this.choices || Object.keys(this.choices).length === 0) {
      throw new Error("Choices are required");
    }

    // 選択肢に答えが含まれているか検証
    const choiceKeys = Object.keys(this.choices);
    if (!choiceKeys.includes(this.answer)) {
      throw new Error(`Answer '${this.answer}' is not in choices: ${choiceKeys.join(", ")}`);
    }
  }

  /**
   * 問題データからQuestionオブジェクトを作成するファクトリメソッド
   */
  static create(data: {
    id: string;
    lang: string;
    domain: string;
    stem: string;
    choices: Choices;
    answer: string;
    explanation: string;
    updatedAt?: number | Date;
  }): Question {
    const domain = data.domain as Domain;
    const answer = data.answer as ChoiceLabel;
    const updatedAt = data.updatedAt instanceof Date
      ? data.updatedAt
      : data.updatedAt
        ? new Date(data.updatedAt)
        : new Date();

    return new Question(
      data.id,
      data.lang,
      domain,
      data.stem,
      data.choices,
      answer,
      data.explanation || "",
      updatedAt
    );
  }
} 