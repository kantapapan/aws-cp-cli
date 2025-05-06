/**
 * ドメイン層のエラーを表す基底クラス
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

/**
 * エンティティの検証に失敗した場合のエラー
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Validation Error: ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * リソースが見つからない場合のエラー
 */
export class NotFoundError extends DomainError {
  constructor(resourceType: string, id: string) {
    super(`${resourceType} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * 質問が足りない場合のエラー
 */
export class InsufficientQuestionsError extends DomainError {
  constructor(domain: string | undefined, requested: number, available: number) {
    const domainMsg = domain ? `in domain '${domain}'` : '';
    super(`Insufficient questions ${domainMsg}: requested ${requested}, but only ${available} available`);
    this.name = 'InsufficientQuestionsError';
  }
}

/**
 * 試験セッションの状態が不正な場合のエラー
 */
export class InvalidSessionStateError extends DomainError {
  constructor(message: string) {
    super(`Invalid session state: ${message}`);
    this.name = 'InvalidSessionStateError';
  }
}

/**
 * 重複問題が検出された場合のエラー
 */
export class DuplicateQuestionsError extends Error {
  public readonly duplicateQuestions: { id: string, stem: string, similarityScore: number }[];

  constructor(duplicates: { id: string, stem: string, similarityScore: number }[]) {
    const count = duplicates.length;
    super(`${count}件の重複問題が検出されました。問題IDリスト: ${duplicates.map(d => d.id).join(', ')}`);
    this.name = 'DuplicateQuestionsError';
    this.duplicateQuestions = duplicates;
  }
} 