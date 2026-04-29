# Plateforme de Suivi des Recommandations Bancaires

Socle applicatif Next.js + TypeScript pour le suivi des recommandations CAC / Inspection / Régulateur.

## Stack
- Front: Next.js, TypeScript, Tailwind, shadcn/ui (à intégrer via composants `components/ui`), React Hook Form, Zod, Recharts.
- Back: API routes / server actions, services métiers séparés, validation serveur systématique.
- DB: Supabase PostgreSQL + Prisma, schéma `suivi_reco`, tables de paramétrage dédiées.
- Auth: Supabase Auth avec trajectoire SSO/AD.

## Architecture
- `app/`: modules dashboard, missions, recommendations, actions, evidences, reports, admin, audit-log.
- `components/`: ui, forms, tables, charts, workflow, badges, modals.
- `lib/`: auth, supabase, prisma, permissions, validators, workflow, notifications, audit.
- `services/`: services métiers par domaine.
- `prisma/`: schéma, seed paramétrage.

## Principes clés implémentés
1. **Aucune règle métier en dur**: statuts, coefficients, workflows et règles de relance doivent être maintenus en tables de paramétrage (`ParameterSetting` + référentiels dédiés).
2. **Auditabilité**: journalisation des événements critiques via `AuditLog`.
3. **Sécurité**: middleware d'authentification, RBAC prévu via tables `Role`, `Permission`, `UserRole`, `RolePermission`.
4. **Scalabilité**: architecture modulaire, services métiers découplés et compatible cloud/on-prem.

## Prochaines étapes
- Ajouter les migrations Prisma et politiques RLS Supabase.
- Intégrer composants shadcn/ui et écrans opérationnels.
- Implémenter workflows multi-niveaux, relances automatiques et reporting régulateur.
