# AWS Deployment Assets

This folder contains placeholder ECS task definitions used by the GitHub Actions deploy workflow.

## Files
- `ecs-taskdef-backend.json` — Fargate task definition template for the NestJS API
- `ecs-taskdef-frontend.json` — Fargate task definition template for the Next.js app (optional if using Amplify)

## How It Works
The deploy workflow renders these templates by replacing `<PLACEHOLDER>` values with GitHub Secrets,
then registers the task definition and updates ECS services.

## Required Secrets (for real deploy)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID`, `AWS_REGION`
- `ECR_BACKEND_REPO`, `ECR_FRONTEND_REPO`
- `ECS_CLUSTER`, `ECS_BACKEND_SERVICE` (and optionally `ECS_FRONTEND_SERVICE`)
- `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`
- `SUPABASE_ANON_KEY`, `API_URL`

## Optional
- `AMPLIFY_APP_ID`, `AMPLIFY_BRANCH` (to trigger Amplify deployments)
