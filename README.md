# Plateforme de Suivi des Recommandations Bancaires

Socle applicatif Next.js + TypeScript pour le suivi des recommandations CAC / Inspection / Régulateur.

## Variables d'environnement à créer dans Vercel

### Obligatoires (runtime applicatif)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (chaîne PostgreSQL Supabase compatible Prisma)
- `DIRECT_URL` (connexion directe Supabase pour migrations Prisma)

### Sécurité / Auth applicative
- `APP_URL` (URL publique de l'application)
- `SESSION_COOKIE_NAME` (ex: `sb-access-token`)
- `SESSION_TTL_MINUTES`
- `ENCRYPTION_KEY` (32+ caractères)
- `AUDIT_LOG_SALT`

### Notifications / relances
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `TEAMS_WEBHOOK_URL` (optionnel)

### Exports / jobs planifiés
- `CRON_SECRET`
- `EXPORT_SIGNING_KEY`

## Scripts SQL Supabase

Exécuter les scripts dans l'ordre dans l'éditeur SQL Supabase :
1. `supabase/sql/001_init_suivi_reco.sql`
2. `supabase/sql/003_import_excel_workflow.sql`
3. `supabase/sql/002_rls_policies.sql`

> Le script `001` crée le schéma `suivi_reco`, les tables métier, RBAC, audit et paramétrage.
> Le script `003` ajoute le module d'import Excel, les canevas, les parties prenantes, les commentaires et l'historique de statuts.
> Le script `002` active RLS et pose des politiques de base (service role backend + lecture référentiels).

## Stack
- Front: Next.js, TypeScript, Tailwind, shadcn/ui (à intégrer via composants `components/ui`), React Hook Form, Zod, Recharts.
- Back: API routes / server actions, services métiers séparés, validation serveur systématique.
- DB: Supabase PostgreSQL + Prisma, schéma `suivi_reco`, tables de paramétrage dédiées.
- Auth: Supabase Auth avec trajectoire SSO/AD.

## Architecture
- `app/`: modules dashboard, missions, recommendations, actions, evidences, import-excel, reports, admin, audit-log.
- `components/`: ui, forms, tables, charts, workflow, badges, modals.
- `lib/`: auth, supabase, prisma, permissions, validators, workflow, notifications, audit.
- `services/`: services métiers par domaine.
- `prisma/`: schéma, seed paramétrage.

## Principes clés implémentés
1. **Aucune règle métier en dur**: statuts, coefficients, workflows et règles de relance doivent être maintenus en tables de paramétrage (`ParameterSetting` + référentiels dédiés).
2. **Auditabilité**: journalisation des événements critiques via `AuditLog`.
3. **Sécurité**: proxy d'authentification, RBAC prévu via tables `Role`, `Permission`, `UserRole`, `RolePermission`.
4. **Scalabilité**: architecture modulaire, services métiers découplés et compatible cloud/on-prem.

## Module Import Excel
- Écran `/import-excel` : upload `.xlsx/.xls`, choix du type d'import, détection de colonnes, mapping manuel, prévisualisation, erreurs ligne par ligne et historique.
- API routes : `/api/import-excel/upload`, `/api/import-excel/confirm`, `/api/import-excel/history`.
- Les lignes sont d'abord sauvegardées dans `import_batches`, `import_rows` et `import_errors`; l'import définitif alimente ensuite missions, recommandations, actions, commentaires, parties prenantes et historique de statut.
- La dépendance `xlsx` est fournie en package local `vendor/xlsx` pour garantir un build reproductible dans les environnements où le registre npm public bloque le paquet.

## Prochaines étapes
- Remplacer les données de démonstration des tableaux par des requêtes filtrées côté serveur.
- Brancher Supabase Auth sur les permissions fines par rôle/entité/confidentialité dans chaque page.
- Industrialiser les exports Excel/PDF/Word comité et les relances automatiques.

## Correctifs déploiement Vercel
- Mise à jour de Next.js vers une version patchée (`16.0.0`) pour éviter la version vulnérable `15.0.4` signalée au build.
- Ajout d'un `proxy.ts` à la racine du projet (point d'entrée attendu par Next.js) avec `matcher` explicite.
