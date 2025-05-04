import { StatsStore, ExamResult } from '../../usecase/ports/StatsStore.js';
import { ExamMode } from '../../domain/ExamSession.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { injectable } from 'tsyringe';

/**
 * 統計情報をJSONファイルに保存するStatsStoreの実装
 */
@injectable()
export class FileStatsStore implements StatsStore {
  private statsFilePath: string;
  private results: ExamResult[] = [];
  private isInitialized = false;

  /**
   * @param statsFilePath 統計情報を保存するJSONファイルのパス
   */
  constructor() {
    // ESMでの相対パス解決
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.statsFilePath = path.resolve(__dirname, '../../../data/stats.json');
  }

  /**
   * ストアを初期化する
   * ファイルが存在しない場合は、空の統計情報が作成される
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await fs.access(this.statsFilePath);
      const data = await fs.readFile(this.statsFilePath, 'utf-8');
      
      // JSONからデータを復元
      const rawResults = JSON.parse(data);
      this.results = rawResults.map((raw: any) => ({
        ...raw,
        timestamp: new Date(raw.timestamp)
      }));
    } catch (error) {
      // ファイルが存在しない場合は空の配列で初期化
      this.results = [];
      
      // ディレクトリが存在しない場合は作成
      const directory = path.dirname(this.statsFilePath);
      await fs.mkdir(directory, { recursive: true });
      
      // 空のJSONファイルを作成
      await this.saveToFile();
    }
    
    this.isInitialized = true;
  }

  /**
   * 統計情報をファイルに保存する
   */
  private async saveToFile(): Promise<void> {
    const data = JSON.stringify(this.results, null, 2);
    await fs.writeFile(this.statsFilePath, data, 'utf-8');
  }

  /**
   * 試験結果を保存する
   * @param result 保存する試験結果
   */
  async save(result: ExamResult): Promise<void> {
    await this.initialize();
    this.results.push(result);
    await this.saveToFile();
  }

  /**
   * すべての試験結果を読み込む
   * @returns 試験結果の配列
   */
  async loadAll(): Promise<ExamResult[]> {
    await this.initialize();
    return this.results;
  }

  /**
   * 特定のモードの試験結果を読み込む
   * @param mode 試験モード
   * @returns 指定された試験モードの結果配列
   */
  async loadByMode(mode: ExamMode): Promise<ExamResult[]> {
    await this.initialize();
    return this.results.filter(result => result.mode === mode);
  }

  /**
   * 統計情報を取得する
   * @returns 平均スコア、最高スコア、ドメイン別の平均スコアを含む統計情報
   */
  async getStats(): Promise<{
    avgScore: number;
    highestScore: number;
    totalExams: number;
    domainAvgs: Record<string, number>;
  }> {
    await this.initialize();
    
    if (this.results.length === 0) {
      return {
        avgScore: 0,
        highestScore: 0,
        totalExams: 0,
        domainAvgs: {}
      };
    }
    
    // 平均スコアと最高スコアを計算
    let totalScore = 0;
    let highestScore = 0;
    
    // ドメイン別統計用のデータ構造
    const domainTotals: Record<string, { sum: number; count: number }> = {};
    
    // 各結果を処理
    this.results.forEach(result => {
      totalScore += result.score;
      highestScore = Math.max(highestScore, result.score);
      
      // ドメイン別統計を更新
      Object.entries(result.domainStats).forEach(([domain, correct]) => {
        if (!domainTotals[domain]) {
          domainTotals[domain] = { sum: 0, count: 0 };
        }
        
        domainTotals[domain].sum += correct;
        domainTotals[domain].count += 1;
      });
    });
    
    // ドメイン別の平均値を計算
    const domainAvgs: Record<string, number> = {};
    Object.entries(domainTotals).forEach(([domain, { sum, count }]) => {
      domainAvgs[domain] = Math.round((sum / count) * 10) / 10; // 小数点第一位まで
    });
    
    return {
      avgScore: Math.round((totalScore / this.results.length) * 10) / 10,
      highestScore,
      totalExams: this.results.length,
      domainAvgs
    };
  }
} 