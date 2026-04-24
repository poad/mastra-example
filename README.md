# Mastra Example - AWS Knowledge Agent

AWS の技術的質問に対応する AI エージェントを Mastra フレームワークで構築したサンプルプロジェクトです。

## Features

- **AWS Knowledge MCP サーバー**: AWS の公式ドキュメント、CDK ドキュメント、SOP などを検索可能
- **Context7 MCP サーバー**: プログラミングライブラリの最新ドキュメントを検索
- **Bedrock (Nova 2 Lite) による推論**: Amazon Bedrock の Nova モデルで動作
- **Agent Scorers**: エージェント応答の品質を評価
  - `toolCallAppropriatenessScorer`: ツール呼び出しの適切性を評価
  - `completenessScorer`: 応答の完全性を評価
  - `translationScorer`: 地理的位置の翻訳品質を評価
- **OpenTelemetry による可観測性**: MLflow へのトレース送信

## Architecture

```text
src/mastra/
├── index.ts         # Mastra エントリーポイント (ストレージ、ロガー、オブザーバビリティ設定)
├── agents/
│   └── aws-agent.ts # AWS Agent (Nova 2 Lite + MCP Tools + Memory + Scorers)
├── tools/
│   └── aws-tool.ts  # MCP クライアント (aws-knowledge-mcp-server, context7)
└── scorers/
    └── aws-scorer.ts # 評価関数群
```

## Requirements

- Node.js >= 24.0.0
- pnpm >= 10.33.1
- AWS credentials (Bedrock アクセス用)
- MLflow Tracking Server (オプション)

## Setup

```bash
# 依存関係のインストール
pnpm install

# .env.example をコピーして環境変数を設定
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `AWS_REGION` | Bedrock リージョン | `us-east-1` |
| `MLFLOW_TRACKING_URI` | MLflow サーバーURL | `http://127.0.0.1:5000` |
| `MLFLOW_EXPERIMENT_ID` | MLflow 実験ID | `0` |

## Commands

```bash
pnpm dev   # Mastra Studio を localhost:4111 で起動
pnpm build # 本番用バンドルを生成
pnpm start # サーバーを起動
```

## Output

ビルド成果物は `.mastra/output/` ディレクトリに生成されます。
