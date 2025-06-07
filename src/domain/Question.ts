/**
 * AWS認定試験の問題ドメイン（カテゴリ）を表す列挙型
 */
export enum Domain {
  CLOUD_CONCEPTS = "cloud_concepts",
  SECURITY = "security",
  TECHNOLOGY = "technology",
  BILLING = "billing",
  CLOUD_TECHNOLOGY = "cloud_technology",
  BILLING_PRICING = "billing_pricing",
  // SAA domains
  SAA_SECURE_ARCHITECTURES = "saa_secure_architectures",
  SAA_RESILIENT_ARCHITECTURES = "saa_resilient_architectures",
  SAA_HIGH_PERFORMANCE_ARCHITECTURES = "saa_high_performance_architectures",
  SAA_COST_OPTIMIZED_ARCHITECTURES = "saa_cost_optimized_architectures"
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
 * 問題の重複判定結果を表すインターフェース
 */
export interface DuplicationCheckResult {
  isDuplicate: boolean;
  similarityScore?: number;
  duplicateWith?: Question;
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

  /**
   * この問題が他の問題と重複しているかチェックする
   * 
   * @param other 比較対象の問題
   * @param options 重複チェックのオプション
   * @returns 重複判定結果
   */
  checkDuplication(other: Question, options: {
    stemSimilarityThreshold?: number;
    checkChoices?: boolean;
  } = {}): DuplicationCheckResult {
    // デフォルトオプション
    const { 
      stemSimilarityThreshold = 0.8,
      checkChoices = true
    } = options;

    // 同一IDの場合は重複
    if (this.id === other.id) {
      return {
        isDuplicate: true,
        similarityScore: 1.0,
        duplicateWith: other
      };
    }

    // 完全に同一の問題文の場合は重複
    if (this.stem === other.stem) {
      return {
        isDuplicate: true,
        similarityScore: 1.0,
        duplicateWith: other
      };
    }

    // 問題文の類似度を計算
    const similarity = this.calculateStemSimilarity(other.stem);
    
    // 問題文が類似している場合は重複
    if (similarity >= stemSimilarityThreshold) {
      return {
        isDuplicate: true,
        similarityScore: similarity,
        duplicateWith: other
      };
    }

    // 選択肢の重複チェック（オプション）
    if (checkChoices && this.hasSimilarChoices(other)) {
      return {
        isDuplicate: true,
        similarityScore: 0.7, // 選択肢ベースの類似度は低めに設定
        duplicateWith: other
      };
    }

    // 重複なし
    return {
      isDuplicate: false
    };
  }

  /**
   * 問題文の類似度を計算する
   * @param otherStem 比較対象の問題文
   * @returns 類似度（0.0〜1.0）
   */
  private calculateStemSimilarity(otherStem: string): number {
    const str1 = this.stem.toLowerCase().trim();
    const str2 = otherStem.toLowerCase().trim();
    
    // 完全一致
    if (str1 === str2) return 1.0;
    
    // 簡易的な類似度計算
    // 実運用ではより洗練されたアルゴリズム（Jaro-Winklerなど）の使用を推奨
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * レーベンシュタイン距離を計算（文字列編集距離）
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    
    // 動的計画法で編集距離を計算
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // 削除
          dp[i][j - 1] + 1,      // 挿入
          dp[i - 1][j - 1] + cost // 置換
        );
      }
    }
    
    return dp[m][n];
  }

  /**
   * 選択肢が類似しているかチェック
   */
  private hasSimilarChoices(other: Question): boolean {
    const thisChoices = Object.values(this.choices).map(c => c.toLowerCase().trim()).sort();
    const otherChoices = Object.values(other.choices).map(c => c.toLowerCase().trim()).sort();
    
    // 選択肢の数が異なる場合は類似していないと判断
    if (thisChoices.length !== otherChoices.length) return false;
    
    // 選択肢が80%以上一致する場合は類似と判断
    let matchCount = 0;
    for (let i = 0; i < thisChoices.length; i++) {
      const similarity = 1 - this.levenshteinDistance(thisChoices[i], otherChoices[i]) / 
                        Math.max(thisChoices[i].length, otherChoices[i].length);
      if (similarity >= 0.8) matchCount++;
    }
    
    return matchCount / thisChoices.length >= 0.8;
  }
} 