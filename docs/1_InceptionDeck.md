**提供するのはMarkdown形式**

ユーザーは「Canvasじゃなくて、Markdownに書いて欲しいです」と言っているので、Markdown形式で直接チャットにインラインで提供します。以前作成したCanvas文書を応じて、Markdownバージョンをそのまま送る必要があります。特別なツールの呼出しは不要なので、最終返信でその内容をマークダウン形式で整えてお見せします。


思考時間: 4 秒


# Inception Deck – AWS Certified Cloud Practitioner CLI Quiz App

## 1. Why Are We Here?

* **Self‑learnersが合格できる環境**を提供する（CLF‑C02 対策）。
* **完全オフライン**で動く CLI を最初の UI として実装する。
* Clean Architecture でコアを実装し、将来の Web／モバイル展開を容易にする。
* 100 % OSS（MIT など）で GitHub 公開、企業向け販売はしない。

---

## 2. Elevator Pitch

> **aws‑cp‑cli** は、AWS 初学者がクラウドプラクティショナー試験に合格するための
> オフライン模擬試験ツールです。PDF や Web サービスと違い、
> **65 問・90 分の本番形式**をローカルで再現しつつ、
> DynamoDB で管理された最新問題を **Parquet スナップショット**として
> ワンコマンドで取り込めます。

---

## 3. Product Box

| Front (ユーザー向け)                                                                                        | Back (開発者向け)                                                                        |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| - “65 Questions · 90 min · Real Exam Timer”<br>- “macOS / Windows / Linux”<br>- “Works 100 % Offline” | - Clean Architecture core（UI 差し替え可）<br>- TypeScript 5.x / Node 20+<br>- MIT License |

---

## 4. Not‑List（v1 で**やらないこと**）

| Will Do               | **Will NOT** Do  |
| --------------------- | ---------------- |
| CLI（Inquirer/prompts） | Web／モバイル UI      |
| ローカル成績保存              | クラウド Leaderboard |
| Parquet スナップショット更新    | ライブ API 呼び出し     |
| 1 ユーザー前提              | マルチテナント SaaS     |
| 日本語・英語問題              | 他言語              |

---

## 5. Meet the Neighbors

| Neighbor               | Interaction            |
| ---------------------- | ---------------------- |
| GitHub community       | PR / Issues で改善        |
| OpenAI API             | （任意）問題ドラフト生成           |
| DynamoDB question bank | 問題ソース・夜間 Export        |
| S3 static bucket       | `questions.parquet` 配信 |
| npm Registry           | `npx aws-cp-cli` で配布   |

---

## 6. Solution Sketch

```
DynamoDB ──▶ DDB Export ──▶ S3 (Parquet)
                       ▲
                       │  aws-cp-cli update
Local Parquet ◀── CLI Use‑cases ◀── CLI UI (prompts)
```

*コアは `domain` + `usecase`。Repository 差し替えでデータソースを選択可能。*

---

## 7. Trade‑off Sliders

| 軸              | Lean ◀───▶ Heavy |
| -------------- | ---------------- |
| Scope          | ●────────        |
| Quality        | ●────────        |
| Time‑to‑Market | ────────●        |
| Cost           | ●────────        |
| Innovation     | ───●─────        |

*最小機能 & コード品質を優先し、リリースまで 4 週間を許容。*

---

## 8. Success Metrics

* **≥ 70 %** のベータユーザーが 30 日以内に本試験に合格
* GitHub ⭐ **300** 以上（初年度）
* npm 週次 DL **1 000** 以上（6 か月後）

---

## 9. Risks / Nightmares

| 懸念              | 対策                        |
| --------------- | ------------------------- |
| 問題の正確性・著作権      | SME ダブルレビュー + 類似度チェック     |
| Parquet 読み込み性能  | `parquetjs` 純 JS 版で検証／ベンチ |
| Node メジャーアップデート | CI に LTS + Current を含める   |
| CLI UX が難解      | 初心者ヒアリング・Usability Test   |

---

## 10. Size It Up（概算工数）

| Epic                  | Ideal Days                  |
| --------------------- | --------------------------- |
| ドメイン & Use‑cases      | 5                           |
| CLI UI Scaffold       | 3                           |
| Parquet Repository 実装 | 3                           |
| `update` コマンド + S3 DL | 2                           |
| 成績キャッシュ & Stats       | 3                           |
| CI/CD & Packaging     | 2                           |
| **合計**                | **18 ideal days ≒ 4 weeks** |

---

## 11. Win Conditions

* プロジェクト構成が **直感的** で、外部コントリビューターがすぐ理解できる。
* ユーザーが **65 問を通しで解き、結果が正しく保存** される。
* 6 か月で **100 問以上** のコミュニティ投稿がマージされる。

---

### ✅ 次のドキュメント

**2. システム要件定義書** を続けて作成してよろしいですか？ ご希望を教えてください。
