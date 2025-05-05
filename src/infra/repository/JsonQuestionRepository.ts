import { Domain, Question } from '../../domain/Question.js';
import { QuestionRepository } from '../../usecase/ports/QuestionRepository.js';
import { readFile } from 'fs/promises';
import { NotFoundError } from '../../domain/DomainError.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { injectable } from 'tsyringe';

/**
 * JSONファイルから問題データを読み込むリポジトリ実装
 */
@injectable()
export class JsonQuestionRepository implements QuestionRepository {
  private questions: Question[] = [];
  private dataFilePath: string;
  private isInitialized = false;

  /**
   * @param dataFilePath 問題データが格納されているJSONファイルのパス
   */
  constructor() {
    // ESMでの相対パス解決
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.dataFilePath = path.resolve(__dirname, '../../../data/sample-questions.json');
  }

  /**
   * リポジトリを初期化して問題データを読み込む
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const data = await readFile(this.dataFilePath, 'utf-8');
      const rawQuestions = JSON.parse(data);
      
      // 各問題データからQuestionオブジェクトを作成
      this.questions = rawQuestions.map((q: any) => Question.create(q));
      this.isInitialized = true;
    } catch (error) {
      console.error(`Failed to load questions from ${this.dataFilePath}:`, error);
      throw new Error(`Failed to load questions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 指定されたドメインからランダムに問題を取得する
   * @param params.domain 取得する問題のドメイン（省略可）
   * @param params.count 取得する問題数
   * @param params.lang 問題の言語（省略可）
   * @returns 問題の配列
   */
  async findRandom(params: { domain?: Domain; count: number; lang?: string }): Promise<Question[]> {
    await this.initialize();
    
    // 条件に合う問題をフィルタリング
    let filteredQuestions = this.questions.filter(q => q.lang === 'jp');
    
    if (params.domain) {
      filteredQuestions = filteredQuestions.filter(q => q.domain === params.domain);
    }
    
    // 十分な問題がない場合はそのまま返す
    if (filteredQuestions.length <= params.count) {
      return filteredQuestions;
    }
    
    // ランダムに問題を選択
    return this.getRandomQuestions(filteredQuestions, params.count);
  }

  /**
   * すべての問題を取得する
   * @param lang 問題の言語（省略可）
   * @returns すべての問題の配列
   */
  async findAll(_lang?: string): Promise<Question[]> {
    await this.initialize();
    return this.questions.filter(q => q.lang === 'jp');
  }

  /**
   * 最新の問題データをダウンロードして更新する
   * @param url ダウンロード元のURL（使用しない）
   * @returns 成功した場合はtrue
   */
  async update(_url?: string): Promise<boolean> {
    // このシンプルな実装では、データの更新は行わない
    // 実際のアプリケーションでは、AWSのS3などからデータをダウンロードする処理を実装する
    return false;
  }

  /**
   * 配列からランダムに指定数の要素を選択する
   * @param array 選択元の配列
   * @param count 選択する数
   * @returns ランダムに選択された要素の配列
   */
  private getRandomQuestions<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
} 