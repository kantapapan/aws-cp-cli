import { Domain, Question } from '../../domain/Question.js';

/**
 * 問題を取得するためのリポジトリインターフェース
 */
export interface QuestionRepository {
  setExamType(type: string): void;
  /**
   * 指定されたドメインからランダムに問題を取得する
   * @param params.domain 取得する問題のドメイン（省略可）
   * @param params.count 取得する問題数
   * @param params.lang 問題の言語（jp/en）
   * @returns 問題の配列
   */
  findRandom(params: {
    domain?: Domain;
    count: number;
    lang?: string;
  }): Promise<Question[]>;
  
  /**
   * すべての問題を取得する
   * @param lang 問題の言語（省略可）
   * @returns すべての問題の配列
   */
  findAll(lang?: string): Promise<Question[]>;
  
  /**
   * 最新の問題データをダウンロードして更新する
   * @param url ダウンロード元のURL（省略可）
   * @returns 成功した場合はtrue
   */
  update(url?: string): Promise<boolean>;

  /**
   * 重複をチェックして排除した問題セットを取得する
   * @param params.domain 取得する問題のドメイン（省略可）
   * @param params.count 取得する問題数
   * @param params.lang 問題の言語（jp/en）
   * @param params.similarityThreshold 類似度の閾値（デフォルト：0.8）
   * @returns 重複のない問題の配列
   */
  findRandomWithoutDuplication(params: {
    domain?: Domain;
    count: number;
    lang?: string;
    similarityThreshold?: number;
  }): Promise<Question[]>;
} 