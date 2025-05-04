import { ExamMode } from '../../domain/ExamSession.js';
import { Score } from '../../domain/ExamSession.js';

/**
 * 試験結果を表すインターフェース
 */
export interface ExamResult {
  timestamp: Date;
  mode: ExamMode;
  score: number;
  correct: number;
  total: number;
  domainStats: Record<string, number>;
  duration: number; // 秒単位
}

/**
 * 試験結果の保存と取得を行うインターフェース
 */
export interface StatsStore {
  /**
   * 試験結果を保存する
   * @param result 保存する試験結果
   */
  save(result: ExamResult): Promise<void>;
  
  /**
   * すべての試験結果を読み込む
   * @returns 試験結果の配列
   */
  loadAll(): Promise<ExamResult[]>;
  
  /**
   * 特定のモードの試験結果を読み込む
   * @param mode 試験モード
   * @returns 指定された試験モードの結果配列
   */
  loadByMode(mode: ExamMode): Promise<ExamResult[]>;
  
  /**
   * 統計情報を取得する
   * @returns 平均スコア、最高スコア、ドメイン別の平均スコアを含む統計情報
   */
  getStats(): Promise<{
    avgScore: number;
    highestScore: number;
    totalExams: number;
    domainAvgs: Record<string, number>;
  }>;
} 