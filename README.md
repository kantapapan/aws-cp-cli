# AWS認定クラウドプラクティショナー模擬試験CLI

AWS認定クラウドプラクティショナー試験の対策用模擬試験CLIアプリケーションです。オフラインで動作し、本番形式または練習モードで試験を受けることができます。

![image](https://github.com/user-attachments/assets/1ab522af-8c82-41a7-a172-d1ebea100e86)


## 機能

- 本番形式の模擬試験 (65問、90分)
- ドメイン別の練習問題
- 日本語/英語両対応
- 試験結果の保存と統計
- オフライン対応（インターネット接続不要）

## 必要環境

- Node.js 16以上
- npm または yarn

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/aws-cp-cli.git
cd aws-cp-cli

# 依存パッケージのインストール
npm install

# ビルド
npm run build
```

## 使い方

```bash
# 開発モードで実行
npm run dev

# ビルド後に実行
npm start
```

## 開発

```bash
# テストの実行
npm test

# 継続的テスト
npm run test:watch

# リントチェック
npm run lint

# コードフォーマット
npm run format
```

## プロダクションリリース方法

以下の手順でアプリケーションをプロダクション用にビルドし、実行できます：

```bash
# プロダクション用にビルド
npm run build

# アプリケーションを実行
npm start

# または直接実行ファイルを使用
node dist/index.js
```

グローバルインストールする場合は以下の手順で行います：

```bash
# グローバルにインストール（開発環境）
npm link

# グローバルにインストール（本番環境）
npm install -g .

# インストール後は以下のコマンドで実行可能
aws-cp-cli
```

## プロジェクト構造

このプロジェクトはClean Architectureに基づいて構築されています。

```
src/
├── domain/         # ドメイン層 (エンティティとビジネスルール)
├── usecase/        # ユースケース層 (アプリケーションのビジネスロジック)
│   └── ports/      # インターフェース定義
├── interface-adapter/ # インターフェースアダプタ層
│   └── cli/        # CLIインターフェース
└── infra/          # インフラストラクチャ層 (外部リソースとの接続)
    └── repository/ # データストアの実装
```

## ライセンス

MIT

## 作者

romamed 
