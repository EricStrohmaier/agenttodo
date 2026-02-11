# Supabase Database Guide

## Quick Start

### Applying Migrations (Remote)
Go to Supabase Dashboard > SQL Editor > paste migration > Run

Run migrations in order: 001 → 002 → ... → 010

## Schema Overview

| Migration | Tables/Features |
|-----------|-----------------|
| 001 | `chat_sessions`, `chat_messages` + helper functions |
| 002 | `users` (profile, credits, Stripe ID) |
| 003 | `child_profiles` |
| 004 | `books`, `book_spreads` (with format_id, layout JSONB) |
| 005 | `credit_transactions` + credit functions |
| 006 | `style_previews`, `story_concepts` |
| 007 | `generation_events`, `waitlist`, `feedback` |
| 008 | Storage buckets (photos, generated, exports) |
| 009 | Views (`v_user_dashboard`, `v_book_library`) + utilities |
| 010 | Admin policies + `admin_grant_credits()` |

## Key Tables

```
users
├── story_credits (INTEGER) ← single source of truth for credits
├── stripe_customer_id
└── user_type ('customer' | 'admin')

books
├── format_id (TEXT) → references lib/book-formats.ts
├── child_data (JSONB) → snapshot of character at generation
└── status ('draft' | 'generating' | 'complete' | 'error' | 'archived')

book_spreads
├── layout_template_id (TEXT) → references lib/layout-templates.ts
├── layout (JSONB) → flexible positioned elements
└── status ('pending' | 'generating' | 'complete' | 'error')
```

## Hardcoded Config (in code, not DB)

- **Book formats**: `lib/book-formats.ts` (square_8x8, a4_portrait, etc.)
- **Layout templates**: `lib/layout-templates.ts` (text_left_image_right, full_bleed, etc.)
- **Stripe products**: Define in code, not DB

## Key Functions

```sql
-- Credits
SELECT add_credits(user_id, 5, 'purchase', 'Bought 5 credits', 'pi_xxx');
SELECT use_credits(user_id, 1, book_id, 'Generated book');
SELECT has_sufficient_credits(user_id, 1);

-- Books
SELECT can_create_book(user_id);
SELECT soft_delete_book(book_id, user_id);

-- Logging (for debugging)
SELECT log_generation_event(
    user_id, 'page_spread', true,
    '{"prompt": "..."}'::jsonb,  -- request
    '{"image_url": "..."}'::jsonb,  -- response
    1500,  -- duration_ms
    book_id, spread_id, 0, 'watercolor', 'imagen-3'
);

-- Admin (requires user_type = 'admin')
SELECT admin_grant_credits(target_user_id, 10, 'Beta tester reward');
```

## Storage Buckets

| Bucket | Public | Limit | Use |
|--------|--------|-------|-----|
| `photos` | No | 10MB/file | User uploaded child reference photos (up to 5) |
| `generated` | Yes | 10MB/file | AI-generated images |
| `exports` | No | 100MB/file | PDF exports |

Path pattern: `{user_id}/{book_id}/{filename}`

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

## Troubleshooting

### Column doesn't exist error
Migrations are idempotent - safe to re-run. They use `IF NOT EXISTS` and `DO $$ ... END $$` blocks.

### RLS blocking queries
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```
